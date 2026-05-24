"use client";

import { useRouter } from "next/navigation";
import { Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAssignmentStore, validateForm } from "@/store/assignmentStore";
import { createAssignment } from "@/lib/api";
import { FileUpload } from "./FileUpload";
import { QuestionTypesForm } from "./QuestionTypesForm";

export function AssignmentForm() {
  const router = useRouter();
  const form = useAssignmentStore((s) => s.form);
  const errors = useAssignmentStore((s) => s.errors);
  const isSubmitting = useAssignmentStore((s) => s.isSubmitting);
  const setField = useAssignmentStore((s) => s.setField);
  const setErrors = useAssignmentStore((s) => s.setErrors);
  const setSubmitting = useAssignmentStore((s) => s.setSubmitting);
  const setAssignmentId = useAssignmentStore((s) => s.setAssignmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subject", form.subject.trim());
      fd.append("dueDate", form.dueDate);
      fd.append(
        "questionTypes",
        JSON.stringify(form.questionTypes.filter((t) => t.count > 0))
      );
      fd.append("additionalInstructions", form.additionalInstructions.trim());
      if (form.file) fd.append("file", form.file);

      const result = await createAssignment(fd);
      setAssignmentId(result.id);
      router.push(`/generate/${result.id}`);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : "Submission failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Step progress bar */}
      <div className="h-1 w-full rounded-full bg-gray-100">
        <div className="h-1 w-1/2 rounded-full bg-ink-dark transition-all" />
      </div>

      {/* Assignment Details */}
      <section>
        <h2 className="mb-1 text-sm font-semibold text-ink-main">Assignment Details</h2>
        <p className="mb-4 text-xs text-ink-muted">
          Add information about your assignment
        </p>

        {/* File upload */}
        <FileUpload />

        {/* Title + Subject */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-main">Title</label>
            <input
              type="text"
              placeholder="e.g. Mid Term – Physics"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-main">Subject</label>
            <input
              type="text"
              placeholder="e.g. Physics"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
          </div>
        </div>
      </section>

      {/* Due Date */}
      <section>
        <label className="mb-1 block text-sm font-semibold text-ink-main">Due Date</label>
        <div className="relative max-w-xs">
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
          />
          <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
      </section>

      {/* Question Types */}
      <section>
        <QuestionTypesForm />
      </section>

      {/* Additional Instructions */}
      <section>
        <label className="mb-1 block text-sm font-semibold text-ink-main">
          Additional Information{" "}
          <span className="text-xs font-normal text-ink-muted">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Generate a question paper for a 3-hour level examination..."
          value={form.additionalInstructions}
          onChange={(e) => setField("additionalInstructions", e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
        />
      </section>

      {errors.submit && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.submit}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-main hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-xl bg-ink-dark px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
