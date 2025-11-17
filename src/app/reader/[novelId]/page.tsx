import { notFound, redirect } from "next/navigation";
import { ReaderView } from "@/components/reader-view";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReaderPageProps = {
  params: Promise<{
    novelId: string;
  }>;
  searchParams: Promise<{
    chapter?: string;
  }>;
};

// Enable static optimization where possible
export const dynamic = 'force-dynamic'; // Required due to auth check
export const revalidate = 0;

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const { novelId } = await params;
  const search = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Optimized query - select only needed fields
  const novel = await prisma.novel.findFirst({
    where: {
      id: novelId,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverImage: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
    },
  });

  if (!novel) {
    notFound();
  }

  const requestedIndex = Number(search.chapter);
  const initialIndex = Number.isFinite(requestedIndex) ? requestedIndex : 0;

  return <ReaderView novel={novel} initialIndex={initialIndex} />;
}
