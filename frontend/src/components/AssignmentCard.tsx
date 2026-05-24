"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

export function AssignmentCard({ assignment, onDelete, onView }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-shadow hover:shadow-md">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-ink-main leading-snug">
          {assignment.title}
        </h3>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-ink-main transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-dropdown">
              <button
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-ink-main hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onView?.(assignment.id);
                  setMenuOpen(false);
                }}
              >
                View Assignment
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-brand-red hover:bg-red-50 transition-colors"
                onClick={() => {
                  onDelete(assignment.id);
                  setMenuOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-ink-muted">
        <span>
          <span className="font-medium">Assigned on:</span>{" "}
          <span>{assignment.assignedOn}</span>
        </span>
        <span className="mx-1 text-gray-300">|</span>
        <span>
          <span className="font-medium">Due:</span>{" "}
          <span>{assignment.dueDate}</span>
        </span>
      </div>
    </div>
  );
}
