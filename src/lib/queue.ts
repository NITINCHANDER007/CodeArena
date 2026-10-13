import { Queue } from "bullmq";
import getRedisClient from "./redis";

export const SUBMISSION_QUEUE_NAME = "submission-queue";

let submissionQueue: Queue | null = null;

export function getSubmissionQueue(): Queue | null {
  try {
    if (!submissionQueue) {
      const redis = getRedisClient();
      submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
        connection: redis,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });
    }
    return submissionQueue;
  } catch (err: any) {
    console.warn("⚠️ Could not initialize BullMQ Queue:", err.message);
    return null;
  }
}
