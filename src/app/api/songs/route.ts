import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Define Schema if not already in a separate file
const SongSchema = new mongoose.Schema({
  name: String,
  artist: [String],
  coverUrl: String,
  fileUrl: String, // We keep this in DB, but won't send it to client
  duration: Number,
  mood: String,
  createdAt: { type: Date, default: Date.now },
});

const Song = mongoose.models.Song || mongoose.model("Song", SongSchema);

export async function GET() {
  await dbConnect();
  try {
    const songs = await Song.find({}).sort({ createdAt: -1 });

    // TRANSFORM DATA: Hide 'fileUrl', replace with proxy URL
    const safeSongs = songs.map((song) => ({
      _id: song._id,
      name: song.name,
      artist: song.artist,
      coverUrl: `/api/cover/${song._id}`,
      duration: song.duration,
      mood: song.mood,
      // The Magic: The frontend sees this, NOT the real dropbox/storage link
      fileUrl: `/api/stream/${song._id}`,
    }));

    return NextResponse.json({ songs: safeSongs });
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
