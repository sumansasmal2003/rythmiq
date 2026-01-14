"use client";

import Link from "next/link";

interface ArtistListProps {
  artists: string[];
  className?: string;
}

export function ArtistList({ artists, className = "" }: ArtistListProps) {
  // SAFETY FIX: Flatten the array and split by commas to handle "clumped" data
  // e.g. ["Drake, Future"] becomes ["Drake", "Future"]
  const displayArtists = artists
    .flatMap((a) => a.split(","))
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  return (
    <span className={className}>
      {displayArtists.map((artist, index) => (
        <span key={`${artist}-${index}`}>
          <Link
            href={`/artist/${encodeURIComponent(artist)}`}
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent card clicks
            className="hover:text-indigo-600 hover:underline transition-colors"
          >
            {artist}
          </Link>
          {index < displayArtists.length - 1 && ", "}
        </span>
      ))}
    </span>
  );
}
