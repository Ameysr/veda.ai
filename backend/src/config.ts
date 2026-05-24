import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  redisEnabled: process.env.REDIS_ENABLED !== "false" && process.env.DISABLE_REDIS !== "true",
  openaiKey: process.env.OPENAI_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

