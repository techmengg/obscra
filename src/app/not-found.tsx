import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020202] px-6 text-zinc-100">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">404</p>
      <p className="text-center text-sm text-zinc-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/library"
        className="border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-zinc-200"
      >
        Go to Library
      </Link>
    </div>
  );
}

