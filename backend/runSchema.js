// Script to run schema.sql against Supabase
import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
});

const schema = fs.readFileSync(
  path.join(__dirname, "models", "schema.sql"),
  "utf-8"
);

try {
  console.log("🔄 Running schema against Supabase...");
  await pool.query(schema);
  console.log("✅ Schema created successfully!");
} catch (err) {
  console.error("❌ Schema error:", err.message);
} finally {
  await pool.end();
}
