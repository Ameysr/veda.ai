"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { QuestionPaperView } from "@/components/QuestionPaperView";
import { ActionBar } from "@/components/ActionBar";
import { getAssignment, generatePaper, updateAssignmentPaper, downloadPdf } from "@/lib/api";
import type { StoredAssignment } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [assignment, setAssignment] = useState<StoredAssignment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  useEffect(() => {
    const a = getAssignment(id);
    if (a) {
      setAssignment(a);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleRegenerate = async () => {
    if (!assignment) return;
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const fd = new FormData();
      fd.append("title", assignment.title);
      fd.append("subject", assignment.subject);
      fd.append("dueDate", assignment.dueDate);
      fd.append("questionTypes", JSON.stringify(assignment.questionTypes));
      fd.append("additionalInstructions", assignment.additionalInstructions);

      const newPaper = await generatePaper(fd);
      updateAssignmentPaper(id, newPaper);
      setAssignment({ ...assignment, questionPaper: newPaper });
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!assignment) return;
    setIsDownloading(true);
    try {
      await downloadPdf(assignment);
    } catch (err) {
      alert("PDF download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (!assignment && !notFound) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
      </>
    );
  }

  // Not found — redirect to create
  if (notFound) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4">
          <AlertCircle className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">Assignment not found.</p>
          <button
            onClick={() => router.push("/create")}
            className="btn-primary"
          >
            Create New Assignment
          </button>
        </main>
      </>
    );
  }

  // Regenerating overlay
  if (isRegenerating) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-gray-500">Regenerating question paper…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-28 sm:px-6">
        {regenError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {regenError}
          </div>
        )}
        <div className="card mb-8 print:shadow-none">
          <QuestionPaperView paper={assignment!.questionPaper} />
        </div>
      </main>
      <ActionBar
        onDownloadPdf={handleDownloadPdf}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
        isDownloading={isDownloading}
      />
    </>
  );
}
