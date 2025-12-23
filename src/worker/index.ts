import { Queue, QueueEvents, Worker } from "bullmq";
import { decideRetry } from "./retry-policy";

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
  console.log(
    JSON.stringify(
      { queueName, redisUrl, concurrency, prefix, maxAttempts, backoffMs, dlqName, dlqEnabled, dryRun: true },
      null,
      2
    )
  );
  process.exit(0);
}

const connection = { host: new URL(redisUrl).hostname, port: Number.parseInt(new URL(redisUrl).port || "6379", 10) };

const queue = new Queue(queueName, { connection, prefix });
const dlq = dlqEnabled ? new Queue(dlqName, { connection, prefix }) : null;

const worker = new Worker(
  queueName,
  async (job) => {
    // Placeholder processor; replace with real handlers per job name.
    console.log(`Received job ${job.id} (${job.name})`, job.data);
  },
  { connection, concurrency, prefix }
);

const events = new QueueEvents(queueName, { connection, prefix });

worker.on("failed", async (job, err) => {
  if (!job) return;
  const decision = decideRetry(job.attemptsMade ?? 0, maxAttempts, backoffMs);

  if (decision.action === "retry") {
    await queue.add(
      job.name,
      job.data,
      {
        backoff: { type: "fixed", delay: decision.delayMs },
        attempts: Math.max(1, maxAttempts - (job.attemptsMade ?? 0)),
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
    console.warn(`Job ${job.id} scheduled for retry with ${decision.delayMs}ms backoff`);
    return;
  }

  if (decision.action === "dlq" && dlq) {
    await dlq.add(
      job.name,
      { ...job.data, failedReason: err?.message, originalJobId: job.id },
      { removeOnComplete: true, removeOnFail: true }
    );
    console.error(`Job ${job.id} moved to DLQ ${dlqName}`);
    return;
  }

  console.error(`Job ${job.id} failed with no retry:`, err);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

events.on("failed", ({ jobId, failedReason }) => {
  console.error(`Queue event failed for job ${jobId}: ${failedReason}`);
});

events.on("completed", ({ jobId }) => {
  console.log(`Queue event completed for job ${jobId}`);
});

const shutdown = async () => {
  console.log("Shutting down worker...");
  await queue.close();
  if (dlq) {
    await dlq.close();
  }
  await worker.close();
  await events.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
