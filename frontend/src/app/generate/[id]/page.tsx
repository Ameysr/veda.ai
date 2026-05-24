"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignment } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/websocket";

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const status = useAssignmentStore((s) => s.status);
  const progress = useAssignmentStore((s) => s.progress);
  const generationError = useAssignmentStore((s) => s.generationError);
  const hydrateFromResponse = useAssignmentStore((s) => s.hydrateFromResponse);
  const setStatus = useAssignmentStore((s) => s.setStatus);
  const setGenerationError = useAssignmentStore((s) => s.setGenerationError);

  const poll = useCallback(async () => {
    try {
      const data = await getAssignment(id);
      hydrateFromResponse(data);
      if (data.status === "completed") {
        router.replace(`/output/${id}`);
      }
    } catch {
      setGenerationError("Failed to load assignment status");
    }
  }, [id, hydrateFromResponse, router, setGenerationError]);

  useEffect(() => {
    poll();
    const unsub = subscribeToAssignment(id, {
      onProgress: ({ status: s, progress: p }) => {
        setStatus(s as "pending" | "processing" | "completed" | "failed", p);
      },
      onComplete: () => {
        router.replace(`/output/${id}`);
      },
      onFailed: ({ error }) => {
        setGenerationError(error);
      },
    });

    const interval = setInterval(poll, 3000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [id, poll, router, setStatus, setGenerationError]);

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        {generationError ? (
          <div className="card max-w-md text-center">
            <p className="mb-4 text-red-600">{generationError}</p>
            <button
              onClick={() => poll()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : (
          <GenerationProgress
            progress={progress}
            status={status || "pending"}
          />
        )}
      </main>
    </>
  );
}
