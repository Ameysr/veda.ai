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

export interface AssignmentForm {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  file: File | null;
}

export interface AssignmentResponse {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: JobStatus;
  progress: number;
  error?: string;
  questionPaper?: QuestionPaper;
}

export const QUESTION_TYPE_OPTIONS: QuestionTypeConfig[] = [
  { type: "mcq", label: "Multiple Choice Questions", count: 0, marksPerQuestion: 1 },
  { type: "short_answer", label: "Short Questions", count: 0, marksPerQuestion: 2 },
  { type: "long_answer", label: "Diagram/Graph-Based Questions", count: 0, marksPerQuestion: 5 },
  { type: "true_false", label: "Numerical Problems", count: 0, marksPerQuestion: 3 },
  { type: "fill_blank", label: "Fill in the Blank", count: 0, marksPerQuestion: 1 },
];
