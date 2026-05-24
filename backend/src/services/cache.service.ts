import { getRedisConnection } from "../queues/connection";
import type { JobStatus, QuestionPaper } from "../types";
import { config } from "../config";

const PREFIX = "vedaai:assignment:";

// In-memory cache fallback when Redis is disabled or down
const memoryCache = new Map<string, any>();

export async function setJobStatus(
  assignmentId: string,
  status: JobStatus,
  progress: number
): Promise<void> {
  if (!config.redisEnabled) {
    memoryCache.set(`${PREFIX}${assignmentId}`, {
      status,
      progress,
      updatedAt: new Date().toISOString(),
    });
    return;
  }
  try {
    const redis = getRedisConnection();
    await redis.hset(`${PREFIX}${assignmentId}`, {
      status,
      progress: String(progress),
      updatedAt: new Date().toISOString(),
    });
    await redis.expire(`${PREFIX}${assignmentId}`, 86400);
  } catch (err) {
    console.warn("Failed to set job status in Redis, using in-memory fallback:", err);
    memoryCache.set(`${PREFIX}${assignmentId}`, {
      status,
      progress,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function getJobStatus(assignmentId: string): Promise<{
  status: JobStatus;
  progress: number;
} | null> {
  if (!config.redisEnabled) {
    const data = memoryCache.get(`${PREFIX}${assignmentId}`);
    if (!data) return null;
    return {
      status: data.status,
      progress: Number(data.progress || 0),
    };
  }
  try {
    const redis = getRedisConnection();
    const data = await redis.hgetall(`${PREFIX}${assignmentId}`);
    if (!data.status) return null;
    return {
      status: data.status as JobStatus,
      progress: parseInt(data.progress || "0", 10),
    };
  } catch (err) {
    console.warn("Failed to get job status from Redis, using in-memory fallback:", err);
    const data = memoryCache.get(`${PREFIX}${assignmentId}`);
    if (!data) return null;
    return {
      status: data.status,
      progress: Number(data.progress || 0),
    };
  }
}

export async function cacheQuestionPaper(
  assignmentId: string,
  paper: QuestionPaper
): Promise<void> {
  if (!config.redisEnabled) {
    memoryCache.set(`${PREFIX}${assignmentId}:paper`, paper);
    return;
  }
  try {
    const redis = getRedisConnection();
    await redis.set(
      `${PREFIX}${assignmentId}:paper`,
      JSON.stringify(paper),
      "EX",
      3600
    );
  } catch (err) {
    console.warn("Failed to cache paper in Redis, using in-memory fallback:", err);
    memoryCache.set(`${PREFIX}${assignmentId}:paper`, paper);
  }
}

export async function getCachedPaper(
  assignmentId: string
): Promise<QuestionPaper | null> {
  if (!config.redisEnabled) {
    return memoryCache.get(`${PREFIX}${assignmentId}:paper`) || null;
  }
  try {
    const redis = getRedisConnection();
    const raw = await redis.get(`${PREFIX}${assignmentId}:paper`);
    if (!raw) return null;
    return JSON.parse(raw) as QuestionPaper;
  } catch (err) {
    console.warn("Failed to get cached paper from Redis, using in-memory fallback:", err);
    return memoryCache.get(`${PREFIX}${assignmentId}:paper`) || null;
  }
}

