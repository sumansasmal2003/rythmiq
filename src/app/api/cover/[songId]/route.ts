import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Song from "@/models/Song"; // Ensure Song model is imported

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params;

    // 1. SECURITY: Anti-Hotlink / Anti-Direct Access
    const referer = req.headers.get("referer") || "";
    const host = req.headers.get("host") || "";

    // If the request didn't come from your site, block it.
    if (referer && !referer.includes(host)) {
       return new NextResponse("Forbidden", { status: 403 });
    }

    await dbConnect();

    // 2. Fetch Real URL from DB
    // (We use mongoose.models.Song to avoid recompilation errors)
    const song = await Song.findById(songId);

    if (!song || !song.coverUrl) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // 3. Fetch the actual image from the hidden source (Dropbox/S3/etc)
    const externalResponse = await fetch(song.coverUrl);
    const contentType = externalResponse.headers.get("Content-Type") || "image/jpeg";
    const buffer = await externalResponse.arrayBuffer();

    // 4. Return the image data directly
    return new NextResponse(Buffer.from(buffer), {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400", // Cache for 1 day
        }
    });

  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
