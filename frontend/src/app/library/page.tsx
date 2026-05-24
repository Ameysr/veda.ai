import type { Metadata } from "next";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "VedaAI | My Library",
  description: "Browse your saved assignments, resources, and generated content.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-main sm:text-3xl">
          My Library
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Browse your saved assignments, resources, and generated content.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-gray-200 bg-white gap-3">
        <Clock className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-ink-muted">Your library is empty. Saved items will appear here.</p>
      </div>
    </div>
  );
}
