import { QueueEvents, Worker } from "bullmq";

const queueName = process.env.BULLMQ_QUEUE ?? "helpdesk-default";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const concurrency = Number.parseInt(process.env.WORKER_CONCURRENCY ?? "5", 10);
const prefix = process.env.BULLMQ_PREFIX ?? "helpdesk";
const dryRun = process.argv.includes("--dry-run") || process.env.WORKER_DRY_RUN === "true";

if (dryRun) {
  // CI/dev smoke path: log config and exit without touching Redis.
  console.log(
    JSON.stringify(
      { queueName, redisUrl, concurrency, prefix, dryRun: true },
      null,
      2
    )
  );
  process.exit(0);
}

const connection = redisUrl;

const worker = new Worker(
  queueName,
  async (job) => {
    // Placeholder processor; replace with real handlers per job name.
    console.log(`Received job ${job.id} (${job.name})`, job.data);
  },
  { connection, concurrency, prefix }
);

const events = new QueueEvents(queueName, { connection, prefix });

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
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
  await worker.close();
  await events.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
