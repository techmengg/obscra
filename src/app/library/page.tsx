import Link from "next/link";
import { redirect } from "next/navigation";
import { EpubImport } from "@/components/epub-import";
import { SignOutButton } from "@/components/sign-out-button";
import { LibraryItemActions } from "@/components/library-item-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Enable dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LibraryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Optimized query with indexed fields
  const novels = await prisma.novel.findMany({
    where: { userId: session.user.id! },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverImage: true,
      updatedAt: true,
      lastReadAt: true,
      lastReadChapter: {
        select: {
          id: true,
          title: true,
          position: true,
        },
      },
      _count: {
        select: { chapters: true },
      },
    },
  });

  return (
    <div className="relative min-h-screen text-zinc-100">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/75 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(64,240,170,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(120,180,255,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(120,255,200,0.06),transparent_42%)] blur-[1px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs md:text-sm text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="uppercase tracking-[0.25em] md:tracking-[0.3em] text-emerald-200/80">
                Obscra
              </span>
            </div>
            <SignOutButton />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xl md:text-2xl text-zinc-50">Library</div>
            <div className="h-px flex-1 bg-zinc-800/70" />
            <span className="rounded-md border border-zinc-800/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em] text-zinc-300">
              {novels.length ? `${novels.length} saved` : "Nothing yet"}
            </span>
          </div>
        </header>

        <div className="rounded-2xl border border-zinc-900/60 bg-black/60 p-4 shadow-[0_16px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <EpubImport />
        </div>

        <section className="flex flex-col divide-y divide-zinc-900/70 overflow-hidden rounded-2xl border border-zinc-900/60 bg-black/60 shadow-[0_16px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          {novels.length === 0 && (
            <p className="px-4 py-5 text-xs md:text-sm text-zinc-500">
              Imported chapters will show up here.
            </p>
          )}
          {novels.map((novel) => {
            const summary = novel.description
              ? String(novel.description).replace(/<[^>]+>/g, "").trim()
              : null;
            const totalChapters = novel._count.chapters;
            const lastReadPosition = novel.lastReadChapter?.position ?? null;
            const currentChapterNumber =
              typeof lastReadPosition === "number"
                ? Math.min(lastReadPosition + 1, totalChapters)
                : 0;
            const progressLabel =
              totalChapters > 0 ? `${currentChapterNumber}/${totalChapters}` : "0/0";
            return (
              <div
                key={novel.id}
                className="flex flex-col gap-2 px-4 py-4 transition hover:bg-zinc-900/40 md:flex-row md:items-center md:gap-3"
              >
                <Link href={`/reader/${novel.id}`} className="flex flex-1 gap-3 text-left md:gap-4">
                  <div className="h-16 w-12 md:h-20 md:w-16 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
                    {novel.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={novel.coverImage}
                        alt={`${novel.title} cover`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] md:text-[10px] uppercase tracking-[0.25em] md:tracking-[0.3em] text-zinc-600">
                        no cover
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between text-xs md:text-sm text-zinc-500">
                      <span className="truncate">{novel.author || "Unknown"}</span>
                      <span className="ml-2 flex items-center gap-2 text-emerald-200/80">
                        <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                          {progressLabel}
                        </span>
                        {novel.lastReadChapter?.title && (
                          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:inline">
                            {novel.lastReadChapter.title}
                          </span>
                        )}
                      </span>
                    </div>
                    <h2 className="text-sm md:text-lg text-zinc-50 leading-tight">{novel.title}</h2>
                    {summary && (
                      <p className="max-h-8 md:max-h-10 overflow-hidden text-ellipsis text-xs md:text-sm text-zinc-500 leading-snug">
                        {summary}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex items-center justify-between md:justify-end md:gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Updated {novel.updatedAt.toLocaleDateString()}
                  </span>
                  <LibraryItemActions novelId={novel.id} title={novel.title} />
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
