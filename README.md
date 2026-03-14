# SniperThink Full Stack Assignment

This repository contains both parts of the hiring assignment:

- `frontend/`: React + Vite interactive strategy flow
- `backend/`: Node.js + Express file-processing API with BullMQ, Redis, and PostgreSQL

## Project Structure

```text
SniperThink/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- data/
|  |  |- hooks/
|  |  |- App.jsx
|  |  |- index.css
|  |- package.json
|- backend/
|  |- config/
|  |- controllers/
|  |- routes/
|  |- services/
|  |- workers/
|  |- models/
|  |  |- schema.sql
|  |- server.js
|  |- testApi.js
|  |- testWorkerFlow.js
|  |- package.json
|- package.json
```

## Features

### Frontend

- Four strategy steps rendered from structured data in `frontend/src/data/strategySteps.js`
- Distinct animations per step
- Scroll-driven reveal animation for the strategy step
- Hover-based card tilt interaction
- Fixed page scroll progress bar
- Step progress indicator tied to the active section
- Interest modal with loading, success, and error states
- Responsive layout for desktop and mobile

### Backend

- `POST /api/upload` for PDF and TXT files up to 10 MB
- PostgreSQL persistence for users, files, jobs, results, and interest submissions
- BullMQ queue backed by Redis
- Background worker with concurrency and retry support
- Job status endpoint with progress reporting
- Result endpoint for completed jobs
- `POST /api/interest` endpoint used by the frontend CTA flow
- Local file fallback for interest submissions when PostgreSQL is temporarily unavailable

## Tech Stack

- Frontend: React 19, Vite, Framer Motion, Axios
- Backend: Node.js, Express, BullMQ, ioredis, PostgreSQL, multer, pdf-parse

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 7+

## Installation

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

## Environment Variables

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### Backend

Create `backend/.env`:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sniperthink
DB_SSL=false

WORKER_CONCURRENCY=3
MAX_JOB_RETRIES=3

# Use either REDIS_URL or REDIS_HOST / REDIS_PORT
REDIS_URL=redis://127.0.0.1:6379
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379
# REDIS_USERNAME=
# REDIS_PASSWORD=
# REDIS_TLS=false
```

## Database Setup

```bash
psql -U postgres -c "CREATE DATABASE sniperthink;"
psql -U postgres -d sniperthink -f backend/models/schema.sql
```

## Running Locally

Run frontend and backend together:

```bash
npm run dev
```

Run the worker in a separate terminal:

```bash
npm run worker
```

Or run services individually:

```bash
npm run dev --prefix frontend
npm run dev --prefix backend
npm run worker --prefix backend
```

## API

### POST `/api/upload`

Uploads a PDF or TXT file and creates an async processing job.

Request: `multipart/form-data`

- `file`: required
- `name`: required
- `email`: required

Example response:

```json
{
  "jobId": "42",
  "status": "pending",
  "message": "File uploaded and queued for processing."
}
```

### GET `/api/jobs/:jobId/status`

Example response:

```json
{
  "jobId": "42",
  "status": "processing",
  "progress": 75
}
```

### GET `/api/jobs/:jobId/result`

Example response:

```json
{
  "jobId": "42",
  "wordCount": 1200,
  "paragraphCount": 35,
  "topKeywords": ["system", "data", "process"]
}
```

### POST `/api/interest`

Example request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "step": "Strategize"
}
```

Example response:

```json
{
  "success": true,
  "message": "Interest recorded successfully."
}
```

If PostgreSQL is unavailable, this endpoint falls back to `backend/data/interest-submissions.json`
so the frontend interest flow can still be demonstrated locally.

## Worker Behavior

- Queue name: `file-processing`
- Retries: controlled by `MAX_JOB_RETRIES`
- Concurrency: controlled by `WORKER_CONCURRENCY`
- Job states: `pending`, `processing`, `completed`, `failed`

Processing pipeline:

1. Upload file
2. Create user, file, and job records
3. Push job to Redis queue
4. Worker extracts text
5. Worker calculates word count, paragraph count, and top keywords
6. Worker saves results and marks the job as completed

## Verification

Frontend:

```bash
npm run build --prefix frontend
npm run lint --prefix frontend
```

Backend:

```bash
node backend/testApi.js
node backend/testWorkerFlow.js
```

The backend smoke tests require a reachable PostgreSQL instance and a running Redis instance.

## Submission Notes

Before sending this assignment, add the external submission artifacts that cannot live inside the local codebase:

- GitHub repository URL
- Live frontend deployment URL
- Live backend deployment URL, if applicable
- Demo video link
