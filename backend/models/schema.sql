-- SniperThink database schema
-- Run: psql -U postgres -d sniperthink -f backend/models/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id          SERIAL PRIMARY KEY,
  file_id     INT REFERENCES files(id) ON DELETE CASCADE,
  status      VARCHAR(20) DEFAULT 'pending',
  progress    INT DEFAULT 0,
  retry_count INT DEFAULT 0,
  error_msg   TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
  id               SERIAL PRIMARY KEY,
  job_id           INT UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  word_count       INT,
  paragraph_count  INT,
  keywords         JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interest_submissions (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  step       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_file_id ON jobs(file_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_results_job_id ON results(job_id);
