import type { AssignmentResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getAssignments(): Promise<AssignmentResponse[]> {
  const res = await fetch(`${API_URL}/api/assignments`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/assignments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete assignment");
}

export async function createAssignment(
  formData: FormData
): Promise<{ id: string; status: string; progress: number }> {
  const res = await fetch(`${API_URL}/api/assignments`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create assignment");
  }
  return res.json();
}

export async function getAssignment(id: string): Promise<AssignmentResponse> {
  const res = await fetch(`${API_URL}/api/assignments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch assignment");
  return res.json();
}

export async function regenerateAssignment(
  id: string
): Promise<{ id: string; status: string; progress: number }> {
  const res = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to regenerate");
  return res.json();
}

export function getPdfUrl(id: string): string {
  return `${API_URL}/api/assignments/${id}/pdf`;
}
