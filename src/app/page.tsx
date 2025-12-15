import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    return (
      <main className="relative min-h-screen bg-black text-zinc-100">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(60,255,170,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(80,190,255,0.12),transparent_30%),radial-gradient(circle_at_50%_60%,rgba(120,255,200,0.08),transparent_38%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Crect width=%271%27 height=%271%27 fill=%27%23252525%27/%3E%3C/svg%3E')] opacity-40" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">
            Welcome back
          </p>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Jump back into Obscra
            </h1>
            <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
              Your library is synced and ready. Continue where you left off with smooth reading,
              offline-friendly EPUB handling, and uninterrupted TTS.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/library"
              className="rounded-full bg-emerald-400/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-emerald-300 active:scale-95"
            >
              Go to Library
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(64,240,170,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(120,180,255,0.12),transparent_35%),radial-gradient(circle_at_50%_70%,rgba(120,255,200,0.08),transparent_42%)] blur-[2px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Crect width=%271%27 height=%271%27 fill=%27%23252525%27/%3E%3C/svg%3E')] opacity-40" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="text-xs uppercase tracking-[0.28em] text-zinc-300">Obscra</div>
          <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="#tts" className="transition hover:text-white">
              TTS
            </Link>
            <Link href="#cta" className="transition hover:text-white">
              Information
            </Link>
          </nav>
        </header>

        <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
            TTS-first reading
          </p>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Read long-form without friction
            </h1>
            <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
              Obscra keeps your library, preferences, and high-fidelity TTS in sync—so you can
              drift into stories with zero clutter and precise audio control.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4" id="cta">
            <Link
              href="/register"
              className="rounded-full bg-emerald-400/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_12px_60px_rgba(52,211,153,0.18)] transition hover:bg-emerald-300 active:scale-95"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-700/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-zinc-500 hover:text-white active:scale-95"
            >
              Sign in
            </Link>
          </div>
          <div className="relative mt-8 w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-[0_20px_120px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-300/5" />
            <div className="relative grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-black/50 p-5 text-left shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Streaming</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Web Audio TTS</h3>
                <p className="mt-3 text-sm text-zinc-400">
                  Decoded in Web Audio for gapless playback. Smart buffering keeps ~10s ahead while
                  workers split chapters into natural sentences.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-700/60 bg-black/50 p-5 text-left">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Control</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Hands-free reading</h3>
                <p className="mt-3 text-sm text-zinc-400">
                  Floating controls, paragraph skip, auto-advance to next chapter, and device/AI
                  voice switching without losing position.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-20 md:grid-cols-3"
        >
          {[
            {
              title: "Import EPUBs",
              body: "Clean parsing, cover detection, and metadata—drop files and start reading fast.",
            },
            {
              title: "Reader Themes",
              body: "Dial in typography, margins, line-height, and paragraph spacing to match your eyes.",
            },
            {
              title: "Progress Sync",
              body: "Chapter progress persists automatically so you resume exactly where you left off.",
            },
            {
              title: "Dual TTS",
              body: "Switch between device voices and ElevenLabs streaming without resetting state.",
            },
            {
              title: "Network-aware",
              body: "Optimized for low bandwidth; requires connectivity for sync and TTS.",
            },
            {
              title: "Keyboard & Mobile",
              body: "Arrow navigation, smooth scroll, and mobile-friendly overlays keep you in flow.",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-6 backdrop-blur transition hover:border-emerald-400/30"
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent" />
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{item.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section
          id="tts"
          className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pb-24 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/60 px-4 py-2 text-[0.7rem] uppercase tracking-[0.26em] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Precision audio
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Crisp, buffered audio while you read
          </h2>
          <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
            Audio chunks stream in 2–5s slices, decoded via Web Audio for perfect timing. Paragraph
            skipping and auto-advance keep narration locked to your reading pace.
          </p>
          <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {[
              "Worker sentence splitting",
              "~10s rolling buffer",
              "Device + AI voice swap",
            ].map((tag) => (
              <div
                key={tag}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 px-4 py-4 text-center text-xs uppercase tracking-[0.2em] text-zinc-200 shadow-[0_10px_50px_rgba(0,0,0,0.35)]"
              >
                {tag}
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-zinc-900/80 bg-black/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <span className="text-zinc-400">©</span>
            <span className="tracking-[0.18em] uppercase text-zinc-300">Obscra</span>
          </span>
          <a
            href="https://x.com/s4lvaholic"
            className="text-zinc-400 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            @s4lvaholic
          </a>
        </div>
      </footer>
    </main>
  );
}
