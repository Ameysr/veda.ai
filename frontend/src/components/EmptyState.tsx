"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-16 px-4">
      {/* Illustration */}
      <div className="relative mb-8 h-52 w-52">
        {/* Background soft circle */}
        <div className="absolute inset-0 m-auto h-44 w-44 rounded-full bg-gray-100" />

        {/* Decorative sparkles */}
        <svg className="absolute left-2 top-6 h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5z" />
        </svg>
        <div className="absolute bottom-10 left-6 h-2 w-2 rounded-full bg-blue-400" />
        <div className="absolute right-4 top-4 h-2.5 w-2.5 rotate-45 border-2 border-blue-400" />

        {/* Document card */}
        <div className="absolute left-8 top-8 z-10 flex h-28 w-24 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-md">
          {/* Top bar placeholder */}
          <div className="mb-2 flex gap-1">
            <div className="h-1.5 w-5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
          </div>
          <div className="mb-1.5 h-2 w-full rounded-full bg-gray-800" />
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-gray-200" />
          <div className="mb-1.5 h-1.5 w-full rounded-full bg-gray-200" />
          <div className="mb-1.5 h-1.5 w-5/6 rounded-full bg-gray-200" />
          <div className="h-1.5 w-2/3 rounded-full bg-gray-200" />
        </div>

        {/* Magnifying glass circle with X */}
        <div className="absolute bottom-2 right-2 z-20">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-gray-200 bg-white shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-brand-red" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>
          {/* Magnifying glass handle */}
          <div className="absolute -bottom-3 -right-1 h-9 w-3.5 rotate-[40deg] rounded-full bg-gray-300" />
        </div>
      </div>

      <h2 className="mb-2 text-xl font-bold text-ink-main">No assignments yet</h2>
      <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-ink-muted">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-full bg-ink-dark px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Create Your First Assignment
      </button>
    </div>
  );
}
