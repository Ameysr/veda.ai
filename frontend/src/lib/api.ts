import type { QuestionPaper, QuestionTypeConfig } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const LS_KEY = "veda_assignments";

// ── Types ────────────────────────────────────────────────────────────────────

export interface StoredAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  questionPaper: QuestionPaper;
  createdAt: string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function readAll(): StoredAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredAssignment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: StoredAssignment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Return all assignments, newest first */
export function getAssignments(): StoredAssignment[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Find one assignment by id */
export function getAssignment(id: string): StoredAssignment | null {
  return readAll().find((a) => a.id === id) ?? null;
}

/** Persist a new assignment (paper already generated) */
export function saveAssignment(data: StoredAssignment): void {
  const list = readAll();
  // Prevent duplicates on retry
  const filtered = list.filter((a) => a.id !== data.id);
  writeAll([data, ...filtered]);
}

/** Update an existing assignment's paper (regenerate) */
export function updateAssignmentPaper(
  id: string,
  questionPaper: QuestionPaper
): void {
  const list = readAll().map((a) =>
    a.id === id ? { ...a, questionPaper } : a
  );
  writeAll(list);
}

/** Remove an assignment */
export function deleteAssignment(id: string): void {
  writeAll(readAll().filter((a) => a.id !== id));
}

// ── AI Generation (backend call) ──────────────────────────────────────────────

/**
 * Call the stateless backend to generate a question paper.
 * Returns the raw QuestionPaper JSON — the caller saves it to localStorage.
 */
export async function generatePaper(
  formData: FormData
): Promise<QuestionPaper> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Generation failed");
  }
  const data = await res.json();
  return data.questionPaper as QuestionPaper;
}

// ── PDF (backend call) ────────────────────────────────────────────────────────

/**
 * Download PDF for a stored assignment.
 * Sends the paper JSON to the backend which returns a PDF buffer.
 */
export async function downloadPdf(assignment: StoredAssignment): Promise<void> {
  const res = await fetch(`${API_URL}/api/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionPaper: assignment.questionPaper }),
  });
  if (!res.ok) throw new Error("PDF generation failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${assignment.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
