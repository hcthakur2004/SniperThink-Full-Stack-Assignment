import { Router } from "express";
import { getJobStatus, getJobResult } from "../controllers/jobController.js";

const router = Router();

// GET /api/jobs/:jobId/status
router.get("/:jobId/status", getJobStatus);

// GET /api/jobs/:jobId/result
router.get("/:jobId/result", getJobResult);

export default router;
