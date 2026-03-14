import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fallbackDir = path.resolve(__dirname, "..", "data");
const fallbackFile = path.join(fallbackDir, "interest-submissions.json");

function isDatabaseConnectivityError(error) {
  return [
    "ENOTFOUND",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ECONNRESET",
    "EHOSTUNREACH",
  ].includes(error?.code);
}

async function appendToFallbackFile(submission) {
  await fs.mkdir(fallbackDir, { recursive: true });

  let existing = [];
  try {
    const raw = await fs.readFile(fallbackFile, "utf-8");
    existing = JSON.parse(raw);
    if (!Array.isArray(existing)) {
      existing = [];
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  existing.push({
    ...submission,
    storedAt: new Date().toISOString(),
    storage: "file-fallback",
  });

  await fs.writeFile(fallbackFile, JSON.stringify(existing, null, 2));
}

export async function saveInterestSubmission(submission) {
  try {
    await pool.query(
      `INSERT INTO interest_submissions (name, email, step)
       VALUES ($1, $2, $3)`,
      [submission.name, submission.email, submission.step]
    );

    return { storage: "database" };
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) {
      throw error;
    }

    await appendToFallbackFile(submission);
    return { storage: "file-fallback" };
  }
}
