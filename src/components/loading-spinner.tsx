export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020202]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
    </div>
  );
}

