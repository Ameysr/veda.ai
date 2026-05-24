"use client";

import type { QuestionPaper } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";

interface Props {
  paper: QuestionPaper;
}

export function QuestionPaperView({ paper }: Props) {
  return (
    <article className="mx-auto max-w-3xl font-display">
      <header className="border-b-2 border-veda-500 pb-6 text-center">
        <h1 className="text-2xl font-bold text-veda-700 sm:text-3xl">
          {paper.title}
        </h1>
        <p className="mt-1 text-muted">{paper.subject}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm font-medium">
          <span>Total Marks: {paper.totalMarks}</span>
          <span>Duration: {paper.durationMinutes} min</span>
        </div>
      </header>

      <section className="my-8 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-veda-600">
          Student Information
        </h2>
        <div className="space-y-5">
          {["Name", "Roll Number", "Section"].map((label) => (
            <div key={label} className="flex items-end gap-3">
              <span className="shrink-0 text-sm font-medium text-ink">
                {label}:
              </span>
              <span className="flex-1 border-b border-gray-400" />
            </div>
          ))}
        </div>
      </section>

      {paper.generalInstructions.length > 0 && (
        <section className="mb-8 rounded-xl border-l-4 border-veda-500 bg-veda-50/50 px-5 py-4">
          <h2 className="mb-2 text-sm font-bold text-ink">
            General Instructions
          </h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink/90">
            {paper.generalInstructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </section>
      )}

      {paper.sections.map((section) => (
        <section key={section.id} className="mb-10">
          <div className="mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-lg font-bold text-veda-700">{section.title}</h2>
            <p className="text-sm italic text-muted">{section.instruction}</p>
          </div>

          <ol className="space-y-8">
            {section.questions.map((q) => (
              <li key={q.id} className="break-inside-avoid">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">Q{q.number}.</span>
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="ml-auto text-sm font-semibold text-ink">
                    [{q.marks} {q.marks === 1 ? "mark" : "marks"}]
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink/95 sm:text-base">
                  {q.text}
                </p>
                {q.options && q.options.length > 0 && (
                  <ul className="mt-3 space-y-1 pl-6 text-sm">
                    {q.options.map((opt, idx) => (
                      <li key={idx} className="list-[upper-alpha]">
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  );
}
