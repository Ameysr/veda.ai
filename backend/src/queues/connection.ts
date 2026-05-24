import { Redis } from "ioredis";
import { config } from "../config";

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!connection) {
    connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
    connection.on("error", (err) => {
      console.warn("Redis connection warning/error:", err.message);
    });
  }
  return connection;
}
