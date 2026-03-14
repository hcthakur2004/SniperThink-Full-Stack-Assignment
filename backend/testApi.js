import "dotenv/config";
import express from "express";
import cors from "cors";
import { submitInterest } from "./controllers/interestController.js";
import { getJobStatus, getJobResult } from "./controllers/jobController.js";

const app = express();
app.use(express.json());
app.use(cors());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.post("/api/interest", submitInterest);
app.get("/api/jobs/:jobId/status", getJobStatus);
app.get("/api/jobs/:jobId/result", getJobResult);

const server = app.listen(3002, async () => {
  console.log("Test server on :3002");

  try {
    const interestResponse = await fetch("http://localhost:3002/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Harish",
        email: "rrrahul2004@gmail.com",
        step: "Analyze",
      }),
    });
    const interestData = await interestResponse.json();
    console.log("POST /api/interest:", JSON.stringify(interestData));

    const healthResponse = await fetch("http://localhost:3002/health");
    const healthData = await healthResponse.json();
    console.log("GET /health:", JSON.stringify(healthData));

    console.log("\nAPI smoke test passed.");
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
