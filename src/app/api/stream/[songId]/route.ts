import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { Song as SongModel } from "@/models/Song"; // Ensure you have this model exported
// If you don't have a separate model file, you might need to define the Schema here or export it from where you defined it.
// Assuming you have a basic Mongoose model set up.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params;

    // 1. Security Check: Block direct access/hotlinking
    // Ensure the request comes from your own website
    const referer = req.headers.get("referer") || "";
    const origin = req.headers.get("origin") || "";
    const host = req.headers.get("host") || "";

    // Allow if referer contains your host (basic check)
    if (!referer.includes(host)) {
       return new NextResponse("Forbidden", { status: 403 });
    }

    await dbConnect();

    // 2. Find the Real URL
    const song = await mongoose.models.Song.findById(songId);

    if (!song || !song.fileUrl) {
      return new NextResponse("Song not found", { status: 404 });
    }

    // 3. Fetch the external audio file
    // We forward the Range header to support seeking (skipping forward/backward)
    const range = req.headers.get("range");

    const headers: HeadersInit = {};
    if (range) {
        headers['Range'] = range;
    }

    const externalResponse = await fetch(song.fileUrl, { headers });

    // 4. Stream it back to the client
    // We forward relevant headers (Content-Type, Content-Length, Content-Range)
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", externalResponse.headers.get("Content-Type") || "audio/mpeg");
    responseHeaders.set("Cache-Control", "public, max-age=3600");

    if (externalResponse.headers.has("Content-Length")) {
        responseHeaders.set("Content-Length", externalResponse.headers.get("Content-Length")!);
    }
    if (externalResponse.headers.has("Content-Range")) {
        responseHeaders.set("Content-Range", externalResponse.headers.get("Content-Range")!);
    }
    if (externalResponse.headers.has("Accept-Ranges")) {
        responseHeaders.set("Accept-Ranges", externalResponse.headers.get("Accept-Ranges")!);
    }

    return new NextResponse(externalResponse.body, {
        status: externalResponse.status,
        headers: responseHeaders
    });

  } catch (error) {
    console.error("Streaming error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
