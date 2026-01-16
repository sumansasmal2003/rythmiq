import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Song from "@/models/Song";

export async function GET() {
  await dbConnect();

  try {
    const artists = await Song.aggregate([
      // 1. Unwind the artist array (e.g. ["Drake, Future"] becomes "Drake, Future")
      { $unwind: "$artist" },

      // 2. Split strings by comma and Trim whitespace
      // We use $addFields to create a temporary field with the clean split data
      {
        $addFields: {
          processedArtists: {
            $map: {
              input: { $split: ["$artist", ","] }, // Split "Drake, Future" -> ["Drake", " Future"]
              as: "a",
              in: { $trim: { input: "$$a" } } // Trim " Future" -> "Future"
            }
          }
        }
      },

      // 3. Unwind again to get individual artist documents
      { $unwind: "$processedArtists" },

      // 4. Sort by creation to get the latest cover art first
      { $sort: { createdAt: -1 } },

      // 5. Group by the CLEAN artist name
      {
        $group: {
          _id: "$processedArtists",
          songCount: { $addToSet: "$_id" }, // Collect unique song IDs to count accurately
          coverUrl: { $first: "$coverUrl" }
        }
      },

      // 6. Project final shape
      {
        $project: {
          _id: 0,
          name: "$_id",
          songCount: { $size: "$songCount" }, // Count the unique songs
          coverUrl: 1
        }
      },

      // 7. Sort Alphabetically
      { $sort: { name: 1 } }
    ]);

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("Artist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}
