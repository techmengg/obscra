"use client";

import { useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";

export const EpubImport = memo(function EpubImport() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 4;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setStatus(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      input.value = "";
      return;
    }

    setIsUploading(true);
    setStatus("importing...");
    const payload = new FormData();
    payload.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus(data.error || "Import failed.");
        setIsUploading(false);
      } else {
        setStatus("imported");
        router.refresh();
        setTimeout(() => {
          setStatus(null);
          setIsUploading(false);
        }, 2000);
      }
    } catch (error) {
      setStatus("Network error. Please try again.");
      setIsUploading(false);
    }

    input.value = "";
  }, [router]);

  return (
    <label className={`relative flex w-full flex-col gap-1.5 md:gap-2 border border-zinc-800 bg-black/40 px-3 md:px-5 py-4 md:py-6 text-xs md:text-sm text-zinc-400 transition ${
      isUploading ? "cursor-wait opacity-60" : "cursor-pointer hover:border-zinc-200 hover:text-zinc-100"
    }`}>
      <input
        type="file"
        name="file"
        accept=".epub,application/epub+zip"
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
      <span className="text-[0.6rem] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-zinc-500">
        import
      </span>
      <span className="text-xs md:text-sm">{isUploading ? "Importing..." : "Tap to choose an EPUB file"}</span>
      {status && <span className="text-xs text-zinc-300">{status}</span>}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
        </div>
      )}
    </label>
  );
});
