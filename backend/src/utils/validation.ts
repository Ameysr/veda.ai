import { z } from "zod";

const QuestionTypeConfigSchema = z.object({
  type: z.enum([
    "mcq",
    "short_answer",
    "long_answer",
    "true_false",
    "fill_blank",
  ]),
  label: z.string().min(1),
  count: z.number().int().min(0),
  marksPerQuestion: z.number().min(0),
});

export const CreateAssignmentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    subject: z.string().trim().min(1, "Subject is required"),
    dueDate: z.string().min(1, "Due date is required"),
    questionTypes: z.array(QuestionTypeConfigSchema).min(1),
    additionalInstructions: z.string().optional().default(""),
    uploadedText: z.string().optional(),
    fileName: z.string().optional(),
  })
  .refine(
    (data) => data.questionTypes.some((t) => t.count > 0),
    { message: "At least one question type must have count greater than 0" }
  )
  .refine(
    (data) =>
      data.questionTypes.every(
        (t) => t.count === 0 || t.marksPerQuestion > 0
      ),
    { message: "Marks per question must be positive when count is set" }
  );
