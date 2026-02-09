import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload path
        if (!pathname.startsWith("takes/")) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: ["audio/webm", "audio/wav", "audio/mpeg"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max
          tokenPayload: JSON.stringify({
            userId,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Could log upload analytics here
        console.log("Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
