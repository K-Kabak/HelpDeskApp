import { Queue, QueueEvents, Worker } from "bullmq";
import { decideRetry } from "./retry-policy";
import { handleSlaJob } from "@/lib/sla-worker";
import { handleSlaReminder } from "@/lib/sla-reminder";
import type { SlaJobPayload } from "@/lib/sla-jobs";

// Simple structured logger for worker process
type LogLevel = "info" | "warn" | "error";
function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    component: "worker",
    ...(meta ?? {}),
  };
  console.log(JSON.stringify(payload));
}

const queueName = process.env.BULLMQ_QUEUE ?? "helpdesk-default";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const concurrency = Number.parseInt(process.env.WORKER_CONCURRENCY ?? "5", 10);
const prefix = process.env.BULLMQ_PREFIX ?? "helpdesk";
const dryRun = process.argv.includes("--dry-run") || process.env.WORKER_DRY_RUN === "true";
const maxAttempts = Number.parseInt(process.env.WORKER_MAX_ATTEMPTS ?? "3", 10);
const backoffMs = Number.parseInt(process.env.WORKER_BACKOFF_MS ?? "5000", 10);
const dlqEnabled = process.env.WORKER_DLQ_ENABLED !== "false";
const dlqName = process.env.WORKER_DLQ_NAME ?? `${queueName}-dlq`;

if (dryRun) {
  // CI/dev smoke path: log config and exit without touching Redis.
  log("info", "worker.dry_run", {
    queueName,
    redisUrl,
    concurrency,
    prefix,
    maxAttempts,
    backoffMs,
    dlqName,
    dlqEnabled,
  });
  process.exit(0);
}

const connection = { host: new URL(redisUrl).hostname, port: Number.parseInt(new URL(redisUrl).port || "6379", 10) };

const queue = new Queue(queueName, { connection, prefix });
const dlq = dlqEnabled ? new Queue(dlqName, { connection, prefix }) : null;

const worker = new Worker(
  queueName,
  async (job) => {
    log("info", "worker.job.received", {
      jobId: job.id,
      jobName: job.name,
      attemptsMade: job.attemptsMade,
    });

    // Route to appropriate handler based on job name
    switch (job.name) {
      case "first-response":
      case "resolve": {
        // Handle SLA breach detection jobs
        const payload = job.data as SlaJobPayload;
        const result = await handleSlaJob(payload);
        
        if (result.skipped) {
          log("info", "worker.job.skipped", {
            jobId: job.id,
            jobName: job.name,
            reason: result.reason,
          });
          return; // Job completed successfully but was skipped
        }

        log("info", "worker.job.processed", {
          jobId: job.id,
          jobName: job.name,
          auditId: result.auditId,
          notificationId: result.notificationId,
        });
        break;
      }

      case "reminder": {
        // Handle SLA reminder jobs
        const payload = job.data as SlaJobPayload;
        const result = await handleSlaReminder(payload);
        
        if (result.skipped) {
          log("info", "worker.job.skipped", {
            jobId: job.id,
            jobName: job.name,
            reason: result.reason,
          });
          return; // Job completed successfully but was skipped
        }

        log("info", "worker.job.processed", {
          jobId: job.id,
          jobName: job.name,
          notificationId: result.notificationId,
        });
        break;
      }

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  { connection, concurrency, prefix }
);

const events = new QueueEvents(queueName, { connection, prefix });

worker.on("failed", async (job, err) => {
  if (!job) {
    log("warn", "worker.job.failed.no_job");
    return;
  }

  const attemptsMade = job.attemptsMade ?? 0;
  const decision = decideRetry(attemptsMade, maxAttempts, backoffMs);

  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  log("error", "worker.job.failed", {
    jobId: job.id,
    jobName: job.name,
    attemptsMade,
    maxAttempts,
    error: errorMessage,
    errorStack,
    decision: decision.action,
  });

  if (decision.action === "retry") {
    try {
      await queue.add(
        job.name,
        job.data,
        {
          backoff: { type: "fixed", delay: decision.delayMs },
          attempts: Math.max(1, maxAttempts - attemptsMade),
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
      log("info", "worker.job.retry.scheduled", {
        jobId: job.id,
        jobName: job.name,
        delayMs: decision.delayMs,
        remainingAttempts: maxAttempts - attemptsMade - 1,
      });
    } catch (retryError) {
      log("error", "worker.job.retry.failed", {
        jobId: job.id,
        jobName: job.name,
        error: retryError instanceof Error ? retryError.message : String(retryError),
      });
    }
    return;
  }

  if (decision.action === "dlq" && dlq) {
    try {
      await dlq.add(
        job.name,
        { ...job.data, failedReason: errorMessage, originalJobId: job.id },
        { removeOnComplete: true, removeOnFail: true }
      );
      log("warn", "worker.job.dlq.moved", {
        jobId: job.id,
        jobName: job.name,
        dlqName,
        attemptsMade,
      });
    } catch (dlqError) {
      log("error", "worker.job.dlq.failed", {
        jobId: job.id,
        jobName: job.name,
        error: dlqError instanceof Error ? dlqError.message : String(dlqError),
      });
    }
    return;
  }

  log("error", "worker.job.dropped", {
    jobId: job.id,
    jobName: job.name,
    attemptsMade,
    reason: "max_attempts_reached_no_dlq",
  });
});

worker.on("completed", (job) => {
  log("info", "worker.job.completed", {
    jobId: job.id,
    jobName: job.name,
    attemptsMade: job.attemptsMade,
  });
});

events.on("failed", ({ jobId, failedReason }) => {
  log("error", "worker.queue.event.failed", {
    jobId,
    failedReason,
  });
});

events.on("completed", ({ jobId }) => {
  log("info", "worker.queue.event.completed", {
    jobId,
  });
});

const shutdown = async () => {
  log("info", "worker.shutdown.started");
  try {
    await queue.close();
    if (dlq) {
      await dlq.close();
    }
    await worker.close();
    await events.close();
    log("info", "worker.shutdown.completed");
    process.exit(0);
  } catch (error) {
    log("error", "worker.shutdown.error", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
