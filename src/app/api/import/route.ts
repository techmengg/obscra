import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseEpub } from "@/lib/epub";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No EPUB provided." }, { status: 400 });
    }

    // Validate file size (aligned with Vercel limits)
    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4MB." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.epub') && file.type !== 'application/epub+zip') {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an EPUB file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseEpub(buffer, file.name);

    // Increase transaction timeout to handle large content with embedded images
    // Default is 5000ms, but with data URIs for images, content can be very large
    const novel = await prisma.$transaction(
      async (tx) => {
        const novelRecord = await tx.novel.create({
          data: {
            title: parsed.title,
            author: parsed.author,
            description: parsed.description,
            coverImage: parsed.coverImage,
            userId: session.user.id,
          },
        });

        // Batch insert chapters for better performance
        if (parsed.chapters.length > 0) {
          await tx.chapter.createMany({
            data: parsed.chapters.map((chapter, index) => ({
              novelId: novelRecord.id,
              title: chapter.title,
              content: chapter.content,
              position: index,
            })),
          });
        }

        return novelRecord;
      },
      {
        timeout: 120000, // 120 seconds (2 minutes) - enough for large EPUBs with many images
        maxWait: 10000, // Maximum time to wait for a transaction to start
      }
    );

    return NextResponse.json({ success: true, novelId: novel.id });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed. Please try again." },
      { status: 500 }
    );
  }
}
