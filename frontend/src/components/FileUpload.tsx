"use client";

import { useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";

export function FileUpload() {
  const file = useAssignmentStore((s) => s.form.file);
  const setField = useAssignmentStore((s) => s.setField);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setField("file", f);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setField("file", f);
  }, [setField]);

  return (
    <div>
      <p className="mb-3 text-xs text-ink-muted">
        Upload pages of your preferred document/image
      </p>

      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-veda-500" />
            <span className="text-sm font-medium text-ink-main">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setField("file", null)}
            className="rounded-lg p-1 hover:bg-gray-200 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-ink-muted" />
          </button>
        </div>
      ) : (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 transition hover:border-gray-300 hover:bg-gray-100"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-ink-main">
            Choose a file or drag &amp; drop it here
          </p>
          <p className="text-xs text-ink-muted">PDF, DOC, TXT up to 5MB</p>
          <span className="mt-1 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-ink-main hover:bg-gray-50 transition-colors">
            Browse files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,text/plain,application/pdf"
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  );
}
