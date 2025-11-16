import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    novelId: string;
  }>;
};

const updateSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function PATCH(request: Request, context: RouteContext) {
  const { novelId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!novelId) {
    return NextResponse.json({ error: "Missing novel id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    select: { id: true, userId: true },
  });

  if (!novel || novel.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.novel.update({
    where: { id: novelId },
    data: { title: parsed.data.title },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { novelId } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!novelId) {
    return NextResponse.json({ error: "Missing novel id" }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    select: { id: true, userId: true },
  });

  if (!novel || novel.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.chapter.deleteMany({
        where: { novelId },
      });
      await tx.novel.delete({
        where: { id: novelId },
      });
    });
  } catch (error) {
    console.error("Error deleting novel", error);
    return NextResponse.json({ error: "Unable to delete novel." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
