import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { generateQuestionPaper } from "../services/ai.service";
import { generatePdfBuffer } from "../services/pdf.service";
import type { AssignmentInput, QuestionPaper } from "../types";

const router = Router();

// Temporary file storage for uploaded files
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
    if (allowed.includes(file.mimetype) || file.originalname.endsWith(".txt")) {
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
    text: `[Uploaded file: ${fileName}. Use as context reference.]`,
    fileName,
  };
}

/**
 * POST /api/generate
 * Accepts form data, calls AI, returns full questionPaper JSON synchronously.
 * The frontend saves this to localStorage.
 */
router.post(
  "/generate",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const questionTypes =
        typeof req.body.questionTypes === "string"
          ? JSON.parse(req.body.questionTypes)
          : req.body.questionTypes;

      const fileData = await readUploadedText(req.file);

      const input: AssignmentInput = {
        title: req.body.title?.trim() || "Untitled",
        subject: req.body.subject?.trim() || "General",
        dueDate: req.body.dueDate || new Date().toISOString(),
        questionTypes: questionTypes || [],
        additionalInstructions: req.body.additionalInstructions?.trim() || "",
        uploadedText: fileData.text,
        fileName: fileData.fileName,
      };

      const questionPaper = await generateQuestionPaper(input);

      res.json({ questionPaper });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      res.status(500).json({ error: message });
    }
  }
);

/**
 * POST /api/pdf
 * Accepts a questionPaper JSON body, returns a PDF buffer.
 */
router.post("/pdf", async (req: Request, res: Response) => {
  try {
    const paper = req.body.questionPaper as QuestionPaper;
    if (!paper) {
      return res.status(400).json({ error: "questionPaper is required" });
    }

    const buffer = await generatePdfBuffer(paper);
    const safeName = (paper.title || "question_paper").replace(/[^a-z0-9]/gi, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
    res.send(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
