import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const ssl =
  process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "postgres",
      ssl,
    };

export const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log("✅ PostgreSQL (Supabase) connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err.message);
});

export default pool;
