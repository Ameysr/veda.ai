"use client";

import { useAssignmentStore } from "@/store/assignmentStore";
import { QUESTION_TYPE_OPTIONS } from "@/types";
import { X, Plus } from "lucide-react";

export function QuestionTypesForm() {
  const questionTypes = useAssignmentStore((s) => s.form.questionTypes);
  const errors = useAssignmentStore((s) => s.errors);
  const setQuestionType = useAssignmentStore((s) => s.setQuestionType);
  const toggleQuestionType = useAssignmentStore((s) => s.toggleQuestionType);

  const activeTypes = questionTypes.filter((qt) => qt.count > 0);
  const totalQuestions = activeTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = activeTypes.reduce((sum, qt) => sum + qt.count * qt.marksPerQuestion, 0);

  // Available types not yet added
  const availableToAdd = questionTypes.filter((qt) => qt.count === 0);

  const handleAdd = () => {
    if (availableToAdd.length > 0) {
      toggleQuestionType(availableToAdd[0].type, true);
    }
  };

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-ink-main">Question Type</p>

      {errors.questionTypes && (
        <p className="mb-2 text-xs text-red-600">{errors.questionTypes}</p>
      )}

      {/* Table header */}
      <div className="mb-1 grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-1">
        <span className="text-xs font-medium text-ink-muted" />
        <span className="w-28 text-center text-xs font-medium text-ink-muted">No. of Questions</span>
        <span className="w-20 text-center text-xs font-medium text-ink-muted">Marks</span>
        <span className="w-6" />
      </div>

      {/* Question type rows */}
      <div className="space-y-2">
        {questionTypes.map((qt) => {
          if (qt.count === 0) return null;
          return (
            <div
              key={qt.type}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
            >
              {/* Label with minus toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleQuestionType(qt.type, false)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors"
                >
                  <span className="text-sm leading-none">−</span>
                </button>
                <span className="text-sm text-ink-main">{qt.label}</span>
              </div>

              {/* Count */}
              <input
                type="number"
                min={1}
                value={qt.count}
                onChange={(e) =>
                  setQuestionType(qt.type, "count", Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {/* Marks */}
              <input
                type="number"
                min={1}
                step={0.5}
                value={qt.marksPerQuestion}
                onChange={(e) =>
                  setQuestionType(qt.type, "marksPerQuestion", Math.max(0.5, parseFloat(e.target.value) || 1))
                }
                className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {/* Remove */}
              <button
                type="button"
                onClick={() => toggleQuestionType(qt.type, false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remove question type"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add question type */}
      {availableToAdd.length > 0 && (
        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink-main transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add question type
        </button>
      )}

      {/* Totals */}
      {totalQuestions > 0 && (
        <div className="mt-4 flex justify-end gap-6 text-sm text-ink-muted">
          <span>
            Total Questions:{" "}
            <span className="font-semibold text-ink-main">{totalQuestions}</span>
          </span>
          <span>
            Total Marks:{" "}
            <span className="font-semibold text-ink-main">{totalMarks}</span>
          </span>
        </div>
      )}
    </div>
  );
}
