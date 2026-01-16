import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Define Schema if not already in a separate file
// (Ideally, keep this in src/models/Song.ts, but we keep your structure here)
const SongSchema = new mongoose.Schema({
  name: String,
  artist: [String],
  coverUrl: String,
  fileUrl: String,
  duration: Number,
  mood: String,
  createdAt: { type: Date, default: Date.now },
});

const Song = mongoose.models.Song || mongoose.model("Song", SongSchema);

export async function GET(req: Request) {
  await dbConnect();

  try {
    // 1. Get Pagination Query Params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Fetch 20 at a time
    const skip = (page - 1) * limit;

    // 2. Fetch only the requested chunk
    const songs = await Song.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 3. Check if there are more songs to load
    const totalSongs = await Song.countDocuments();
    const hasMore = skip + songs.length < totalSongs;

    // 4. Transform Data
    const safeSongs = songs.map((song) => ({
      _id: song._id,
      name: song.name,
      artist: song.artist,
      coverUrl: `/api/cover/${song._id}`,
      duration: song.duration,
      mood: song.mood,
      fileUrl: `/api/stream/${song._id}`,
    }));

    return NextResponse.json({
        songs: safeSongs,
        hasMore,
        total: totalSongs
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const song = await Song.create(body);
    return NextResponse.json({ success: true, song }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 });
  }
}
