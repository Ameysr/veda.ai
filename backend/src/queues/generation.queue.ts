import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";
import { config } from "../config";

export const GENERATION_QUEUE = "question-generation";

export interface GenerationJobData {
  assignmentId: string;
}

class MockQueue {
  async add(name: string, data: GenerationJobData): Promise<any> {
    console.log(`[MockQueue] Job "${name}" registered for assignment: ${data.assignmentId}`);
    return {
      id: `mock_job_${Date.now()}`,
      data,
    };
  }
}

export const generationQueue = config.redisEnabled
  ? new Queue<GenerationJobData>(GENERATION_QUEUE, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
  : (new MockQueue() as unknown as Queue<GenerationJobData>);

