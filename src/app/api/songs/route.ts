import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Song from "@/models/Song";
import { getPlaiceholder } from "plaiceholder";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // 1. EXTRACT 'mood' HERE (It was missing in your file)
    const { name, artist, coverUrl, fileUrl, duration, mood } = body;

    if (!name || !artist || !fileUrl || !coverUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let blurDataUrl = "";
    try {
      const buffer = await fetch(coverUrl).then(async (res) =>
        Buffer.from(await res.arrayBuffer())
      );
      const { base64 } = await getPlaiceholder(buffer);
      blurDataUrl = base64;
    } catch (err) {
      console.error("Failed to generate blur hash:", err);
    }

    const artistArray = Array.isArray(artist)
      ? artist
      : artist.split(',').map((a: string) => a.trim());

    // 2. PASS 'mood' TO DATABASE
    const newSong = await Song.create({
      name,
      artist: artistArray,
      coverUrl,
      fileUrl,
      duration: Number(duration) || 0,
      blurDataUrl,
      mood: mood || "Chill", // <--- THIS WAS MISSING
    });

    return NextResponse.json(
      { message: "Song added", song: newSong },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const songs = await Song.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ songs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
