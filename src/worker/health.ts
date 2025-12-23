import { Queue } from "bullmq";

type HealthStatus = "ok" | "skip" | "error";

type HealthOptions = {
  dryRun?: boolean;
  sampleFailed?: number;
};

type HealthReport = {
  status: HealthStatus;
  queueName: string;
  redisUrl: string;
  prefix: string;
  counts?: Record<string, number>;
  failedIds?: (string | number)[];
  error?: string;
  note?: string;
};

const queueName = process.env.BULLMQ_QUEUE ?? "helpdesk-default";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const prefix = process.env.BULLMQ_PREFIX ?? "helpdesk";

export async function getQueueHealth(options: HealthOptions = {}): Promise<HealthReport> {
  const dryRun = options.dryRun || process.argv.includes("--dry-run") || process.env.WORKER_HEALTH_DRY_RUN === "true";
  const sampleFailed = options.sampleFailed ?? Number.parseInt(process.env.WORKER_HEALTH_SAMPLE_FAILED ?? "3", 10);

  if (dryRun) {
    return {
      status: "skip",
      queueName,
      redisUrl,
      prefix,
      note: "Dry run; skipped Redis connection.",
    };
  }

  const connection = { host: new URL(redisUrl).hostname, port: Number.parseInt(new URL(redisUrl).port || "6379", 10) };
  const queue = new Queue(queueName, { connection, prefix });

  try {
    const counts = await queue.getJobCounts("waiting", "active", "delayed", "failed", "completed", "paused");
    const failedJobs = sampleFailed > 0 ? await queue.getFailed(0, sampleFailed - 1) : [];
    return {
      status: "ok",
      queueName,
      redisUrl,
      prefix,
      counts,
      failedIds: failedJobs.map((job) => job.id ?? "").filter((id): id is string => id !== undefined),
    };
  } catch (error) {
    return {
      status: "error",
      queueName,
      redisUrl,
      prefix,
      error: (error as Error).message,
    };
  } finally {
    await queue.close();
  }
}

async function runCli() {
  const report = await getQueueHealth();
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "error") {
    process.exit(1);
  }
}

runCli();
