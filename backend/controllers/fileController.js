import pool from "../config/db.js";
import { enqueueFileJob } from "../services/queueService.js";

export async function uploadFile(req, res) {
  const { name, email } = req.body;
  let jobId;
  let committed = false;
  let client;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required." });
  }

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name.trim(), email.trim().toLowerCase()]
    );
    const userId = userResult.rows[0].id;

    const fileResult = await client.query(
      `INSERT INTO files (user_id, file_path, file_name, file_size)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, req.file.path, req.file.originalname, req.file.size]
    );
    const fileId = fileResult.rows[0].id;

    const jobResult = await client.query(
      `INSERT INTO jobs (file_id, status, progress)
       VALUES ($1, 'pending', 0)
       RETURNING id`,
      [fileId]
    );
    jobId = jobResult.rows[0].id;

    await client.query("COMMIT");
    committed = true;

    try {
      await enqueueFileJob({
        jobId,
        filePath: req.file.path,
        fileName: req.file.originalname,
      });
    } catch (queueError) {
      await pool.query(
        `UPDATE jobs
         SET status = 'failed',
             error_msg = $1,
             updated_at = NOW()
         WHERE id = $2`,
        ["Failed to enqueue background job.", jobId]
      );

      console.error("Queue enqueue error:", queueError);
      return res.status(503).json({
        error: "Upload stored, but the job could not be queued. Please retry.",
        jobId: String(jobId),
      });
    }

    return res.status(201).json({
      jobId: String(jobId),
      status: "pending",
      message: "File uploaded and queued for processing.",
    });
  } catch (error) {
    if (!committed && client) {
      await client.query("ROLLBACK");
    }
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client?.release();
  }
}
