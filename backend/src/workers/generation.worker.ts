import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { config } from "../config";
import { Assignment } from "../models/Assignment";
import { GENERATION_QUEUE, GenerationJobData } from "../queues/generation.queue";
import { getRedisConnection } from "../queues/connection";
import { generateQuestionPaper } from "../services/ai.service";
import {
  setJobStatus,
  cacheQuestionPaper,
} from "../services/cache.service";
import {
  emitJobProgress,
  emitJobComplete,
  emitJobFailed,
} from "../websocket";

function safeEmit(fn: () => void): void {
  try {
    fn();
  } catch {
    /* WebSocket unavailable in standalone worker process */
  }
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "processing",
    progress: 10,
  });
  await setJobStatus(assignmentId, "processing", 10);
  safeEmit(() => emitJobProgress(assignmentId, "processing", 10));
  await job.updateProgress(10);

  await job.updateProgress(40);
  await Assignment.findByIdAndUpdate(assignmentId, { progress: 40 });
  await setJobStatus(assignmentId, "processing", 40);
  safeEmit(() => emitJobProgress(assignmentId, "processing", 40));

  const input = {
    title: assignment.title,
    subject: assignment.subject,
    dueDate: assignment.dueDate.toISOString(),
    questionTypes: assignment.questionTypes,
    additionalInstructions: assignment.additionalInstructions,
    uploadedText: assignment.uploadedText,
    fileName: assignment.fileName,
  };

  const paper = await generateQuestionPaper(input);

  await job.updateProgress(80);
  await Assignment.findByIdAndUpdate(assignmentId, { progress: 80 });
  safeEmit(() => emitJobProgress(assignmentId, "processing", 80));

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "completed",
    progress: 100,
    questionPaper: paper,
    error: undefined,
  });
  await setJobStatus(assignmentId, "completed", 100);
  await cacheQuestionPaper(assignmentId, paper);
  safeEmit(() => emitJobProgress(assignmentId, "completed", 100));
  safeEmit(() => emitJobComplete(assignmentId));
}

export async function runGenerationSync(assignmentId: string): Promise<void> {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  try {
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "processing",
      progress: 10,
    });
    await setJobStatus(assignmentId, "processing", 10);
    safeEmit(() => emitJobProgress(assignmentId, "processing", 10));

    await Assignment.findByIdAndUpdate(assignmentId, { progress: 40 });
    await setJobStatus(assignmentId, "processing", 40);
    safeEmit(() => emitJobProgress(assignmentId, "processing", 40));

    const input = {
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      uploadedText: assignment.uploadedText,
      fileName: assignment.fileName,
    };

    const paper = await generateQuestionPaper(input);

    await Assignment.findByIdAndUpdate(assignmentId, { progress: 80 });
    safeEmit(() => emitJobProgress(assignmentId, "processing", 80));

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "completed",
      progress: 100,
      questionPaper: paper,
      error: undefined,
    });
    await setJobStatus(assignmentId, "completed", 100);
    await cacheQuestionPaper(assignmentId, paper);
    safeEmit(() => emitJobProgress(assignmentId, "completed", 100));
    safeEmit(() => emitJobComplete(assignmentId));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "failed",
      error: message,
    });
    await setJobStatus(assignmentId, "failed", 0);
    safeEmit(() => emitJobFailed(assignmentId, message));
    throw err;
  }
}

export async function startGenerationWorker(): Promise<Worker<GenerationJobData> | null> {
  if (!config.redisEnabled) {
    console.log("Redis is disabled. Generation worker will not be started (using in-process fallback instead).");
    return null;
  }

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      try {
        await processJob(job);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const { assignmentId } = job.data;
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "failed",
          error: message,
        });
        await setJobStatus(assignmentId, "failed", 0);
        safeEmit(() => emitJobFailed(assignmentId, message));
        throw err;
      }
    },
    { connection: getRedisConnection(), concurrency: 2 }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log("Generation worker started");
  return worker;
}

async function runStandalone(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log("Worker connected to MongoDB");
  await startGenerationWorker();
}

if (require.main === module) {
  runStandalone().catch(console.error);
}

