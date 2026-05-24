import { create } from "zustand";
import type {
  AssignmentForm,
  AssignmentResponse,
  QuestionPaper,
  JobStatus,
} from "@/types";
import { QUESTION_TYPE_OPTIONS } from "@/types";

interface AssignmentState {
  form: AssignmentForm;
  errors: Record<string, string>;
  assignmentId: string | null;
  status: JobStatus | null;
  progress: number;
  questionPaper: QuestionPaper | null;
  isSubmitting: boolean;
  generationError: string | null;

  setField: <K extends keyof AssignmentForm>(
    key: K,
    value: AssignmentForm[K]
  ) => void;
  setQuestionType: (
    type: string,
    field: "count" | "marksPerQuestion",
    value: number
  ) => void;
  toggleQuestionType: (type: string, enabled: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  setAssignmentId: (id: string | null) => void;
  setStatus: (status: JobStatus, progress?: number) => void;
  setQuestionPaper: (paper: QuestionPaper | null) => void;
  setSubmitting: (v: boolean) => void;
  setGenerationError: (err: string | null) => void;
  hydrateFromResponse: (data: AssignmentResponse) => void;
  resetForm: () => void;
}

const defaultForm: AssignmentForm = {
  title: "",
  subject: "",
  dueDate: "",
  questionTypes: QUESTION_TYPE_OPTIONS.map((t) => {
    if (t.type === "mcq") return { ...t, count: 4 };
    if (t.type === "short_answer") return { ...t, count: 3 };
    if (t.type === "long_answer") return { ...t, count: 5, marksPerQuestion: 5 }; // Diagram/Graph
    if (t.type === "true_false") return { ...t, count: 5, marksPerQuestion: 1 }; // Numerical
    return { ...t };
  }),
  additionalInstructions: "",
  file: null,
};

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  form: { ...defaultForm, questionTypes: defaultForm.questionTypes.map((t) => ({ ...t })) },
  errors: {},
  assignmentId: null,
  status: null,
  progress: 0,
  questionPaper: null,
  isSubmitting: false,
  generationError: null,

  setField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value }, errors: {} })),

  setQuestionType: (type, field, value) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((t) =>
          t.type === type ? { ...t, [field]: value } : t
        ),
      },
    })),

  toggleQuestionType: (type, enabled) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((t) =>
          t.type === type
            ? { ...t, count: enabled ? Math.max(t.count, 1) : 0 }
            : t
        ),
      },
    })),

  setErrors: (errors) => set({ errors }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setStatus: (status, progress) =>
    set((s) => ({
      status,
      progress: progress ?? s.progress,
    })),
  setQuestionPaper: (paper) => set({ questionPaper: paper }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setGenerationError: (err) => set({ generationError: err }),

  hydrateFromResponse: (data) =>
    set({
      assignmentId: data.id,
      status: data.status,
      progress: data.progress,
      questionPaper: data.questionPaper ?? null,
      generationError: data.error ?? null,
    }),

  resetForm: () =>
    set({
      form: {
        ...defaultForm,
        questionTypes: defaultForm.questionTypes.map((t) => ({ ...t })),
      },
      errors: {},
      assignmentId: null,
      status: null,
      progress: 0,
      questionPaper: null,
      generationError: null,
    }),
}));

export function validateForm(form: AssignmentForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.subject.trim()) errors.subject = "Subject is required";
  if (!form.dueDate) errors.dueDate = "Due date is required";
  else if (new Date(form.dueDate) < new Date(new Date().toDateString())) {
    errors.dueDate = "Due date cannot be in the past";
  }

  const active = form.questionTypes.filter((t) => t.count > 0);
  if (active.length === 0) {
    errors.questionTypes = "Select at least one question type with count > 0";
  }

  for (const t of active) {
    if (t.count < 0) errors[`count_${t.type}`] = "Count cannot be negative";
    if (t.marksPerQuestion <= 0)
      errors[`marks_${t.type}`] = "Marks must be greater than 0";
  }

  return errors;
}
