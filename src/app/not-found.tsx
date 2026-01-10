import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#151515] px-6 text-zinc-100">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">404</p>
      <p className="text-center text-sm text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/library"
        className="border-b border-zinc-500 pb-1 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-zinc-300 hover:text-white"
      >
        Go to Library
      </Link>
    </div>
  );
}
