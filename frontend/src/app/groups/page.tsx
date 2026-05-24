import type { Metadata } from "next";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "VedaAI | My Groups",
  description: "View and manage your class groups and student cohorts.",
};

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-main sm:text-3xl">
          My Groups
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Organise your students into groups and cohorts.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-gray-200 bg-white gap-3">
        <Users className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-ink-muted">No groups created yet.</p>
      </div>
    </div>
  );
}
