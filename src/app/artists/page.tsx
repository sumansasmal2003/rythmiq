"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mic2, Play } from "lucide-react";

interface Artist {
  name: string;
  songCount: number;
  coverUrl: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch("/api/artists");
        const data = await res.json();

        if (data.artists) {
          // --- UPDATED: Sort by Song Count (Highest to Lowest) ---
          const sortedArtists = data.artists.sort((a: Artist, b: Artist) => {
             // Primary Sort: Song Count (Descending)
             if (b.songCount !== a.songCount) {
                return b.songCount - a.songCount;
             }
             // Secondary Sort: Alphabetical (A-Z) for ties
             return a.name.localeCompare(b.name);
          });

          setArtists(sortedArtists);
        }
      } catch (error) {
        console.error("Failed to fetch artists", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  if (loading) return <ArtistsSkeleton />;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-10 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
          Artists
        </h1>
        <p className="text-gray-500 font-medium">
          Discover the creators behind the music.
        </p>
      </div>

      {/* Grid */}
      <div className="px-6 md:px-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Link
            key={artist.name}
            href={`/artist/${encodeURIComponent(artist.name)}`}
            className="group relative flex flex-col items-center p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300"
          >
            {/* Circular Avatar with Hover Effect */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-200">
                <Image
                  src={artist.coverUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Play Button Overlay (Spotify Style) */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Play size={32} fill="white" className="text-white drop-shadow-md" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center w-full">
              <h3 className="font-bold text-gray-900 text-lg truncate w-full px-2">
                {artist.name}
              </h3>
              <div className="text-sm text-gray-500 font-medium flex items-center justify-center gap-1.5 mt-1">
                 <Mic2 size={12} />
                 <span>Artist</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full" />
                 <span>{artist.songCount} {artist.songCount === 1 ? 'track' : 'tracks'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ArtistsSkeleton() {
  return (
    <div className="min-h-screen bg-white px-6 md:px-10 pt-10">
      <div className="h-12 w-48 bg-gray-100 rounded-lg mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-40 h-40 bg-gray-100 rounded-full mb-4" />
            <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
