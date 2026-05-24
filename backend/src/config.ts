import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  openaiKey: process.env.OPENAI_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
