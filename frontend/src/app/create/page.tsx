import type { Metadata } from "next";
import { AssignmentForm } from "@/components/AssignmentForm";

export const metadata: Metadata = {
  title: "VedaAI | Create Assignment",
  description: "Create a new AI-generated question paper for your class.",
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-main sm:text-3xl">
          Create Assignment
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Fill in the details below and let AI generate your question paper.
        </p>
      </div>
      <AssignmentForm />
    </div>
  );
}
