"use client";

import { useEffect, useState, use } from "react"; // <--- 1. Import 'use'
import Image from "next/image";
import { Play, Pause, Mic2, ArrowLeft } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ArtistList } from "@/components/ArtistList";

interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
  mood?: string;
}

// <--- 2. Update type: params is a Promise now
export default function ArtistPage({ params }: { params: Promise<{ name: string }> }) {
  // <--- 3. Unwrap the params using the `use()` hook
  const { name } = use(params);
  const artistName = decodeURIComponent(name);

  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeSong, isPlaying, playSmart, setQueue } = usePlayer();

  useEffect(() => {
    async function fetchArtistSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();

        if (data.songs) {
          const artistSongs = data.songs.filter((s: Song) =>
            s.artist.some(a => a.toLowerCase() === artistName.toLowerCase())
          );
          setSongs(artistSongs);
        }
      } catch (error) {
        console.error("Failed to fetch artist songs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtistSongs();
  }, [artistName]);

  const isCurrentSong = (id: string) => activeSong?._id === id && isPlaying;

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSmart(songs[0]);
      setQueue(songs);
    }
  };

  if (loading) return <ArtistSkeleton />;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* 1. Artist Header */}
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-b from-indigo-900 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-10">
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-2xl overflow-hidden bg-gray-800 flex items-center justify-center relative">
                {songs.length > 0 ? (
                    <Image src={songs[0].coverUrl} alt={artistName} fill className="object-cover" />
                ) : (
                    <Mic2 size={48} className="text-gray-400" />
                )}
            </div>

            <div className="mb-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider mb-1">
                    <Mic2 size={16} /> Verified Artist
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    {artistName}
                </h1>
                <p className="text-gray-300 font-medium mt-2">
                    {songs.length} Tracks • Popularity High
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Actions Bar */}
      <div className="px-6 md:px-10 py-6 flex items-center gap-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <button
            onClick={handlePlayAll}
            className="bg-indigo-600 text-white rounded-full px-8 py-3.5 font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200"
        >
            <Play size={20} fill="currentColor" /> Play All
        </button>
        <button className="px-6 py-3.5 rounded-full border border-gray-300 font-bold text-gray-700 hover:border-gray-800 hover:text-black transition-colors">
            Follow
        </button>
      </div>

      {/* 3. Popular Songs List */}
      <div className="px-2 md:px-6 lg:px-10 py-6 max-w-6xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Popular Tracks</h2>

        <div className="space-y-1">
            {songs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No tracks found for this artist.</div>
            ) : (
                songs.map((song, index) => {
                    const isActive = isCurrentSong(song._id);
                    return (
                        <div
                            key={song._id}
                            onClick={() => playSmart(song)}
                            className={`group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-colors
                                ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}
                            `}
                        >
                            {/* Number / Play */}
                            <div className="w-8 flex justify-center text-gray-400 font-medium text-sm">
                                <span className={`group-hover:hidden ${isActive ? "text-indigo-600 font-bold" : ""}`}>
                                    {index + 1}
                                </span>
                                <span className="hidden group-hover:block text-gray-800">
                                    {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <Image src={song.coverUrl} alt={song.name} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className={`font-semibold truncate ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                                        {song.name}
                                    </h3>
                                    <div className="text-sm text-gray-500 truncate group-hover:text-gray-600">
                                        <ArtistList artists={song.artist} />
                                    </div>
                                </div>
                            </div>

                            {/* Duration & Plays */}
                            <div className="flex items-center gap-6 text-sm text-gray-400 font-medium tabular-nums">
                                <span className="hidden md:block">1.2M</span>
                                <span>{formatDuration(song.duration)}</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}

function ArtistSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-80 bg-gray-200 w-full" />
            <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />
                ))}
            </div>
        </div>
    )
}
