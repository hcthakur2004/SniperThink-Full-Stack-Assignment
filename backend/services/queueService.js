import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

const QUEUE_NAME = "file-processing";

export const fileQueue = new Queue(QUEUE_NAME, { connection });

/**
 * Add a file processing job to the queue.
 * @param {object} data - { jobId, filePath, fileName }
 */
export async function enqueueFileJob(data) {
  const job = await fileQueue.add("process-file", data, {
    attempts: parseInt(process.env.MAX_JOB_RETRIES) || 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  });
  return job;
}

export default fileQueue;
