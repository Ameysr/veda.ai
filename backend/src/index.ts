import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { config } from "./config";
import assignmentsRouter from "./routes/assignments.routes";
import { initWebSocket } from "./websocket";
import { startGenerationWorker } from "./workers/generation.worker";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vedaai-backend" });
});

app.use("/api/assignments", assignmentsRouter);

const httpServer = http.createServer(app);
initWebSocket(httpServer);

async function bootstrap(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  await startGenerationWorker();

  httpServer.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
