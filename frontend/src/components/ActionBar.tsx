"use client";

import { Download, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  onDownloadPdf: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  isDownloading?: boolean;
}

export function ActionBar({
  onDownloadPdf,
  onRegenerate,
  isRegenerating,
  isDownloading,
}: Props) {
  return (
    <div className="sticky bottom-0 z-40 -mx-4 border-t border-gray-100 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          New Assignment
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="btn-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="btn-primary"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
