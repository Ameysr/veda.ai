"use client";

import { Loader2, Sparkles } from "lucide-react";

interface Props {
  progress: number;
  status: string;
}

export function GenerationProgress({ progress, status }: Props) {
  return (
    <div className="card mx-auto max-w-lg text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-veda-100">
        <Sparkles className="h-8 w-8 animate-pulse text-veda-500" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-ink">
        Generating Question Paper
      </h2>
      <p className="mb-6 text-sm text-muted">
        AI is structuring sections, questions, and difficulty levels...
      </p>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-veda-500 transition-all duration-500"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
      <p className="flex items-center justify-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {status === "processing" ? "Processing" : "Queued"} — {progress}%
      </p>
    </div>
  );
}
