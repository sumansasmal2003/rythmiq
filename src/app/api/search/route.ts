import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Song from "@/models/Song";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ songs: [] });
    }

    // Search for songs where Name OR Artist matches the query (Case insensitive)
    const songs = await Song.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // 'i' means case-insensitive
        { artist: { $elemMatch: { $regex: query, $options: "i" } } } // Search inside artist array
      ],
    }).limit(5); // Limit to top 5 results for the dropdown

    return NextResponse.json({ songs });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
