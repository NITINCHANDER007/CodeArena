import { Worker, Job } from "bullmq";
import getRedisClient from "../lib/redis";
import { SUBMISSION_QUEUE_NAME } from "../lib/queue";
import { processSubmission } from "../lib/submissionProcessor";

console.log("🚀 Starting CodeArena BullMQ Submission Worker...");

const redis = getRedisClient();

const worker = new Worker(
  SUBMISSION_QUEUE_NAME,
  async (job: Job<{ submissionId: string }>) => {
    const { submissionId } = job.data;
    console.log(`⚡ Processing submission: ${submissionId} (Job ${job.id})`);

    const result = await processSubmission(submissionId);
    console.log(`✅ Submission ${submissionId} finished with status: ${result.status}`);
    return result;
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on("ready", () => {
  console.log("🟢 Worker is ready and listening for submission jobs on Redis!");
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down worker gracefully...");
  await worker.close();
  process.exit(0);
});
