export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "true_false"
  | "fill_blank";

export type Difficulty = "easy" | "medium" | "hard";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  uploadedText?: string;
  fileName?: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
  options?: string[];
}

export interface PaperSection {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  title: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  sections: PaperSection[];
  generalInstructions: string[];
}

export interface AssignmentDocument extends AssignmentInput {
  _id: string;
  status: JobStatus;
  progress: number;
  questionPaper?: QuestionPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
