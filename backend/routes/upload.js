import { Router } from "express";
import { upload } from "../config/multer.js";
import { uploadFile } from "../controllers/fileController.js";

const router = Router();

// POST /api/upload
router.post("/", upload.single("file"), uploadFile);

export default router;
