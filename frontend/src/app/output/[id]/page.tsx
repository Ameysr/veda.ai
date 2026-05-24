"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { QuestionPaperView } from "@/components/QuestionPaperView";
import { ActionBar } from "@/components/ActionBar";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignment, regenerateAssignment } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/websocket";

export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const questionPaper = useAssignmentStore((s) => s.questionPaper);
  const status = useAssignmentStore((s) => s.status);
  const progress = useAssignmentStore((s) => s.progress);
  const hydrateFromResponse = useAssignmentStore((s) => s.hydrateFromResponse);
  const setStatus = useAssignmentStore((s) => s.setStatus);
  const setQuestionPaper = useAssignmentStore((s) => s.setQuestionPaper);

  const [isRegenerating, setIsRegenerating] = useState(false);

  const load = useCallback(async () => {
    const data = await getAssignment(id);
    hydrateFromResponse(data);
    if (data.status === "pending" || data.status === "processing") {
      router.replace(`/generate/${id}`);
    }
  }, [id, hydrateFromResponse, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (status !== "processing" && status !== "pending") return;
    const unsub = subscribeToAssignment(id, {
      onProgress: ({ status: s, progress: p }) => {
        setStatus(s as "pending" | "processing" | "completed" | "failed", p);
      },
      onComplete: async () => {
        setIsRegenerating(false);
        const data = await getAssignment(id);
        hydrateFromResponse(data);
      },
      onFailed: () => setIsRegenerating(false),
    });
    return unsub;
  }, [id, status, setStatus, hydrateFromResponse]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setQuestionPaper(null);
    await regenerateAssignment(id);
    setStatus("pending", 0);
    router.push(`/generate/${id}`);
  };

  if (
    isRegenerating ||
    ((status === "pending" || status === "processing") && !questionPaper)
  ) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
          <GenerationProgress progress={progress} status={status || "pending"} />
        </main>
      </>
    );
  }

  if (!questionPaper) {
    return (
      <>
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted">Loading question paper...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-28 sm:px-6">
        <div className="card mb-8 print:shadow-none">
          <QuestionPaperView paper={questionPaper} />
        </div>
      </main>
      <ActionBar
        assignmentId={id}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />
    </>
  );
}
