"use client";

import Link from "next/link";

interface ArtistListProps {
  artists: string[];
  className?: string;
}

export function ArtistList({ artists, className = "" }: ArtistListProps) {
  return (
    <span className={className}>
      {artists.map((artist, index) => (
        <span key={artist}>
          <Link
            href={`/artist/${encodeURIComponent(artist)}`}
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent card clicks
            className="hover:text-indigo-600 hover:underline transition-colors"
          >
            {artist}
          </Link>
          {index < artists.length - 1 && ", "}
        </span>
      ))}
    </span>
  );
}
