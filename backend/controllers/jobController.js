import pool from "../config/db.js";

/**
 * GET /api/jobs/:jobId/status
 */
export async function getJobStatus(req, res) {
  const { jobId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT id, status, progress FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Job not found." });
    }

    const job = rows[0];
    return res.json({
      jobId: String(job.id),
      status: job.status,
      progress: job.progress,
    });
  } catch (err) {
    console.error("Job status error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /api/jobs/:jobId/result
 */
export async function getJobResult(req, res) {
  const { jobId } = req.params;

  try {
    // Check job exists and is completed
    const { rows: jobRows } = await pool.query(
      `SELECT status FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (!jobRows.length) {
      return res.status(404).json({ error: "Job not found." });
    }

    const job = jobRows[0];
    if (job.status !== "completed") {
      return res.status(404).json({
        error: `Result not available yet. Job status: ${job.status}`,
      });
    }

    const { rows: resultRows } = await pool.query(
      `SELECT word_count, paragraph_count, keywords FROM results WHERE job_id = $1`,
      [jobId]
    );

    if (!resultRows.length) {
      return res.status(404).json({ error: "Result not found." });
    }

    const result = resultRows[0];
    return res.json({
      jobId: String(jobId),
      wordCount: result.word_count,
      paragraphCount: result.paragraph_count,
      topKeywords: result.keywords,
    });
  } catch (err) {
    console.error("Job result error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
