import "dotenv/config";
import fs from "fs";
import { spawn } from "child_process";

const TEST_PORT = process.env.TEST_PORT || "3010";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Starting backend test flow...");

  const server = spawn("node", ["server.js"], {
    env: { ...process.env, PORT: TEST_PORT },
    stdio: "inherit",
  });
  const worker = spawn("node", ["workers/fileWorker.js"], {
    env: process.env,
    stdio: "inherit",
  });

  await delay(3000);

  try {
    console.log("\nUploading sample file...");
    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "testworker@sniperthink.com");
    formData.append(
      "file",
      new Blob([fs.readFileSync("sample.txt")], { type: "text/plain" }),
      "sample.txt"
    );

    const uploadRes = await fetch(`http://localhost:${TEST_PORT}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(await uploadRes.text());
    }

    const uploadData = await uploadRes.json();
    console.log("Upload successful:", uploadData);

    const jobId = uploadData.jobId;

    for (let i = 0; i < 10; i += 1) {
      console.log(`\nChecking status (attempt ${i + 1})...`);
      const statusRes = await fetch(
        `http://localhost:${TEST_PORT}/api/jobs/${jobId}/status`
      );
      const statusData = await statusRes.json();
      console.log("Status:", statusData);

      if (statusData.status === "completed") {
        break;
      }

      if (statusData.status === "failed") {
        throw new Error("Job failed processing.");
      }

      await delay(1500);
    }

    console.log("\nFetching final results...");
    const resultRes = await fetch(
      `http://localhost:${TEST_PORT}/api/jobs/${jobId}/result`
    );
    const resultData = await resultRes.json();
    console.log("Results:", JSON.stringify(resultData, null, 2));

    console.log("\nQueue and worker tests passed.");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    server.kill();
    worker.kill();
    process.exit(0);
  }
}

run();
