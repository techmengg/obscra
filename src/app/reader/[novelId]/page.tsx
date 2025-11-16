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

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const { novelId } = await params;
  const search = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const novel = await prisma.novel.findFirst({
    where: {
      id: novelId,
      userId: session.user.id,
    },
    include: {
      chapters: {
        orderBy: { position: "asc" },
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
