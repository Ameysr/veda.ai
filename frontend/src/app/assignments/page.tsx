"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { AssignmentCard, Assignment } from "@/components/AssignmentCard";
import { EmptyState } from "@/components/EmptyState";
import { getAssignments, deleteAssignment } from "@/lib/api";

function formatDate(dateStr: string | Date): string {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateStr);
  }
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      const mapped = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        assignedOn: formatDate(a.createdAt),
        dueDate: formatDate(a.dueDate),
      }));
      setAssignments(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Failed to delete assignment");
    }
  };

  const handleCreate = () => router.push("/create");

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink-muted" />
          <p className="mt-2 text-sm text-ink-muted">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={loadAssignments}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return <EmptyState onCreate={handleCreate} />;
  }

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page heading */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-ink-main font-display">Assignments</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Manage and track all generated question papers and student schedules.
        </p>
      </div>

      {/* Filter + Search bar */}
      <div className="mb-5 mt-5 flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink-muted hover:border-gray-300 hover:text-ink-main transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">No assignments match your search.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 pb-28 sm:pb-10">
          {filtered.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onDelete={handleDelete}
              onView={(id) => router.push(`/generate/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Desktop floating "+ Create Assignment" button */}
      <div className="fixed bottom-8 left-1/2 hidden -translate-x-1/2 sm:block z-30">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-full bg-ink-dark px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </button>
      </div>
    </div>
  );
}
