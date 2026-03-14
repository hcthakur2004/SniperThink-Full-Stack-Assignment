import dotenv from "dotenv";
import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import pool from "../config/db.js";
import { processFile } from "../services/processingService.js";

dotenv.config();

const CONCURRENCY = Number.parseInt(process.env.WORKER_CONCURRENCY, 10) || 3;

async function updateJob(jobId, status, progress, errorMessage = null) {
  await pool.query(
    `UPDATE jobs
     SET status = $1,
         progress = $2,
         error_msg = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [status, progress, errorMessage, jobId]
  );
}

async function saveResult(jobId, { wordCount, paragraphCount, topKeywords }) {
  const updatedResult = await pool.query(
    `UPDATE results
     SET word_count = $2,
         paragraph_count = $3,
         keywords = $4
     WHERE job_id = $1`,
    [jobId, wordCount, paragraphCount, JSON.stringify(topKeywords)]
  );

  if (updatedResult.rowCount === 0) {
    await pool.query(
      `INSERT INTO results (job_id, word_count, paragraph_count, keywords)
       VALUES ($1, $2, $3, $4)`,
      [jobId, wordCount, paragraphCount, JSON.stringify(topKeywords)]
    );
  }
}

const worker = new Worker(
  "file-processing",
  async (job) => {
    const { jobId, filePath, fileName } = job.data;
    console.log(`[Worker] Processing job ${jobId} for ${fileName}`);

    try {
      await updateJob(jobId, "processing", 0);

      console.log(`[Job ${jobId}] Extracting text`);
      await updateJob(jobId, "processing", 25);

      const result = await processFile(filePath);
      await updateJob(jobId, "processing", 50);

      console.log(
        `[Job ${jobId}] Keywords: ${result.topKeywords.slice(0, 5).join(", ")}`
      );
      await updateJob(jobId, "processing", 75);

      await saveResult(jobId, result);
      await updateJob(jobId, "completed", 100);

      console.log(
        `[Worker] Job ${jobId} completed with ${result.wordCount} words and ${result.paragraphCount} paragraphs`
      );
      return result;
    } catch (error) {
      console.error(`[Worker] Job ${jobId} failed: ${error.message}`);

      await pool.query(
        `UPDATE jobs
         SET retry_count = retry_count + 1,
             updated_at = NOW()
         WHERE id = $1`,
        [jobId]
      );

      const maxRetries = Number.parseInt(process.env.MAX_JOB_RETRIES, 10) || 3;
      const { rows } = await pool.query(
        `SELECT retry_count FROM jobs WHERE id = $1`,
        [jobId]
      );

      if (rows[0]?.retry_count >= maxRetries) {
        await updateJob(jobId, "failed", 0, error.message);
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: CONCURRENCY,
    lockDuration: 60000,
  }
);

worker.on("active", (job) => {
  console.log(`BullMQ job ${job.id} started`);
});

worker.on("completed", (job) => {
  console.log(`BullMQ job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`BullMQ job ${job?.id} failed: ${error.message}`);
});

console.log(`Worker started with concurrency ${CONCURRENCY}`);
