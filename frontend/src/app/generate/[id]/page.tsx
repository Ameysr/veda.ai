"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssignment } from "@/lib/api";
import { Loader2 } from "lucide-react";

/**
 * Legacy generate/[id] route — now just redirects to output/[id].
 * The paper is already saved in localStorage by AssignmentForm.
 */
export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    // If assignment exists in localStorage, go straight to output
    const a = getAssignment(id);
    if (a) {
      router.replace(`/output/${id}`);
    } else {
      // Not found — go home
      router.replace("/");
    }
  }, [id, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </main>
  );
}
