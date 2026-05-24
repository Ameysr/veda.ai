import express from "express";
import cors from "cors";
import { config } from "./config";
import generateRouter from "./routes/generate.routes";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "4mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vedaai-backend" });
});

app.use("/api", generateRouter);

app.listen(config.port, () => {
  console.log(`VedaAI backend running on http://localhost:${config.port}`);
});
