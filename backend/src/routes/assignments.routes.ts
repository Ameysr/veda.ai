import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { Assignment } from "../models/Assignment";
import { CreateAssignmentSchema } from "../utils/validation";
import { generationQueue } from "../queues/generation.queue";
import { getCachedPaper } from "../services/cache.service";
import { generatePdfBuffer } from "../services/pdf.service";
import { config } from "../config";
import { runGenerationSync } from "../workers/generation.worker";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.endsWith(".txt")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or text files allowed"));
    }
  },
});

async function readUploadedText(
  file?: Express.Multer.File
): Promise<{ text?: string; fileName?: string }> {
  if (!file) return {};
  const fileName = file.originalname;
  if (file.mimetype === "text/plain" || file.originalname.endsWith(".txt")) {
    const text = await fs.readFile(file.path, "utf-8");
    await fs.unlink(file.path).catch(() => {});
    return { text: text.slice(0, 8000), fileName };
  }
  await fs.unlink(file.path).catch(() => {});
  return {
    text: `[Uploaded file: ${fileName}. Content used as context reference.]`,
    fileName,
  };
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json(
      assignments.map((a) => ({
        id: a._id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        status: a.status,
        progress: a.progress,
        createdAt: a.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const body = {
        title: req.body.title,
        subject: req.body.subject,
        dueDate: req.body.dueDate,
        questionTypes:
          typeof req.body.questionTypes === "string"
            ? JSON.parse(req.body.questionTypes)
            : req.body.questionTypes,
        additionalInstructions: req.body.additionalInstructions || "",
      };

      const parsed = CreateAssignmentSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }

      const fileData = await readUploadedText(req.file);

      const assignment = await Assignment.create({
        ...parsed.data,
        dueDate: new Date(parsed.data.dueDate),
        uploadedText: fileData.text || parsed.data.uploadedText,
        fileName: fileData.fileName,
        status: "pending",
        progress: 0,
      });

      let jobId = `sync_${Date.now()}`;
      if (config.redisEnabled) {
        try {
          const job = await generationQueue.add("generate", {
            assignmentId: assignment._id.toString(),
          });
          jobId = job.id || jobId;
        } catch (err) {
          console.warn("Failed to add job to Redis queue, falling back to synchronous execution:", err);
          config.redisEnabled = false;
        }
      }

      if (!config.redisEnabled) {
        setTimeout(async () => {
          try {
            await runGenerationSync(assignment._id.toString());
          } catch (err) {
            console.error("In-process generation failed:", err);
          }
        }, 0);
      }

      assignment.jobId = jobId;
      await assignment.save();

      res.status(201).json({
        id: assignment._id,
        status: assignment.status,
        progress: assignment.progress,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Server error";
      res.status(500).json({ error: message });
    }
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    let questionPaper = assignment.questionPaper;
    if (!questionPaper && assignment.status === "completed") {
      questionPaper =
        (await getCachedPaper(req.params.id as string)) ?? questionPaper;
    }

    res.json({
      id: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      status: assignment.status,
      progress: assignment.progress,
      error: assignment.error,
      questionPaper,
      createdAt: assignment.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    assignment.status = "pending";
    assignment.progress = 0;
    assignment.error = undefined;
    assignment.questionPaper = undefined;

    let jobId = `sync_${Date.now()}`;
    if (config.redisEnabled) {
      try {
        const job = await generationQueue.add("generate", {
          assignmentId: assignment._id.toString(),
        });
        jobId = job.id || jobId;
      } catch (err) {
        console.warn("Failed to add job to Redis queue, falling back to synchronous execution:", err);
        config.redisEnabled = false;
      }
    }

    if (!config.redisEnabled) {
      setTimeout(async () => {
        try {
          await runGenerationSync(assignment._id.toString());
        } catch (err) {
          console.error("In-process generation failed:", err);
        }
      }, 0);
    }

    assignment.jobId = jobId;
    await assignment.save();

    res.json({
      id: assignment._id,
      status: assignment.status,
      progress: assignment.progress,
    });
  } catch {
    res.status(500).json({ error: "Failed to regenerate" });
  }
});

router.get("/:id/pdf", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment?.questionPaper) {
      return res.status(404).json({ error: "Question paper not ready" });
    }

    const buffer = await generatePdfBuffer(assignment.questionPaper);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${assignment.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`
    );
    res.send(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
