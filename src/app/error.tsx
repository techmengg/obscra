"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#151515] px-6 text-zinc-100">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Error</p>
      <p className="max-w-md text-center text-sm text-zinc-400">
        {error.message || "Something went wrong. Please try again."}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="border-b border-zinc-500 pb-1 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-zinc-300 hover:text-white"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/library"}
          className="border-b border-zinc-500 pb-1 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-zinc-300 hover:text-white"
        >
          Go to Library
        </button>
      </div>
    </div>
  );
}

