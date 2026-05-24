import mongoose, { Schema, Document } from "mongoose";
import type {
  QuestionPaper,
  QuestionTypeConfig,
  JobStatus,
} from "../types";

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  uploadedText?: string;
  fileName?: string;
  status: JobStatus;
  progress: number;
  questionPaper?: QuestionPaper;
  error?: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    count: { type: Number, required: true, min: 0 },
    marksPerQuestion: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeConfigSchema], required: true },
    additionalInstructions: { type: String, default: "" },
    uploadedText: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    questionPaper: { type: Schema.Types.Mixed },
    error: { type: String },
    jobId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
