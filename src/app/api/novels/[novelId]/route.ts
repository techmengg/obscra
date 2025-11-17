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
  try {
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

    // Check ownership and update in a single query for better performance
    const novel = await prisma.novel.updateMany({
      where: { 
        id: novelId,
        userId: session.user.id
      },
      data: { title: parsed.data.title },
    });

    if (novel.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating novel:", error);
    return NextResponse.json(
      { error: "Failed to update novel" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { novelId } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!novelId) {
      return NextResponse.json({ error: "Missing novel id" }, { status: 400 });
    }

    // Delete with ownership check - cascade will handle chapters automatically
    const result = await prisma.novel.deleteMany({
      where: {
        id: novelId,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting novel:", error);
    return NextResponse.json(
      { error: "Unable to delete novel" },
      { status: 500 }
    );
  }
}
