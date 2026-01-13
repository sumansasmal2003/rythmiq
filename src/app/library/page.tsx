"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Pause, Clock, Music2, BarChart3, Search } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/lib/store";

interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
  blurDataUrl?: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { setActiveSong, activeSong, isPlaying, setQueue, playSmart } = usePlayer();

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (data.songs) {
            setSongs(data.songs);
        }
      } catch (error) {
        console.error("Failed to fetch library", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const handlePlay = (song: Song) => {
    playSmart(song);
  };

  const isCurrentSong = (id: string) => activeSong?._id === id;

  return (
    <div className="min-h-screen bg-white pb-40">

      {/* 1. Large Header (Scrolls Away) */}
      <div className="px-6 md:px-10 pt-10 pb-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          {/* Cover Art */}
          <div className="w-48 h-48 md:w-56 md:h-56 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center text-white shadow-indigo-200">
            <Music2 size={80} />
          </div>

          <div className="flex flex-col gap-3 text-center md:text-left">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-600">Private Playlist</span>
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tighter">
              My Library
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-medium text-sm mt-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">{songs.length}</span> songs
              </div>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Updated today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sticky Table Header & List */}
      <div className="relative">

        {/* THE STICKY HEADER */}
        {/* sticky top-0: Sticks to the very top of the scroll container */}
        {/* z-10: Stays above the scrolling list */}
        {/* bg-white/95 backdrop-blur: Ensures content behind it is not visible (glass effect) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-2 md:px-6 lg:px-10 py-3 shadow-sm transition-all">
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 text-xs font-bold uppercase tracking-wider text-gray-400 px-4">
                <div className="w-8 text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Date Added</div>
                <div className="flex justify-end pr-2"><Clock size={16} /></div>
            </div>
        </div>

        {/* List Content */}
        <div className="px-2 md:px-6 lg:px-10 py-2">
            {loading ? (
            <LibrarySkeleton />
            ) : songs.length === 0 ? (
            <EmptyState />
            ) : (
            <div className="space-y-1 mt-2">
                {songs.map((song, index) => {
                const isActive = isCurrentSong(song._id);
                const isPlayingActive = isActive && isPlaying;

                return (
                    <div
                    key={song._id}
                    onClick={() => handlePlay(song)}
                    className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                        ${isActive
                        ? "bg-indigo-50 shadow-sm"
                        : "hover:bg-gray-50 hover:shadow-sm"
                        }
                    `}
                    >
                    {/* Index / Play Btn */}
                    <div className="w-8 flex justify-center text-gray-400 font-medium text-sm">
                        <span className={`group-hover:hidden ${isActive ? "hidden" : "block"}`}>
                           {index + 1}
                        </span>

                        {/* Playing Animation */}
                        {isActive && isPlaying && (
                             <BarChart3 size={16} className="text-indigo-600 animate-pulse block group-hover:hidden" />
                        )}
                        {isActive && !isPlaying && (
                             <span className="text-indigo-600 font-bold block group-hover:hidden">{index + 1}</span>
                        )}

                        {/* Hover Play Icon */}
                        <span className={`hidden group-hover:block ${isActive ? "text-indigo-600" : "text-gray-800"}`}>
                        {isPlayingActive ? <Pause size={16} /> : <Play size={16} />}
                        </span>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                        <Image
                            src={song.coverUrl}
                            alt={song.name}
                            fill
                            className="object-cover"
                            placeholder={song.blurDataUrl ? "blur" : "empty"}
                            blurDataURL={song.blurDataUrl}
                        />
                        </div>
                        <div className="min-w-0">
                        <h3 className={`font-semibold truncate text-sm md:text-base ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                            {song.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate group-hover:text-gray-600">
                            {song.artist.join(", ")}
                        </p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="hidden md:flex text-sm text-gray-400 font-medium items-center gap-2">
                        {new Date(song.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-gray-400 font-medium tabular-nums text-right pr-2">
                        {formatDuration(song.duration)}
                    </div>

                    </div>
                );
                })}
            </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ... Keep your LoadingSkeleton and EmptyState components as they were ...
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Music2 size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Your library is empty</h3>
      <p className="text-gray-500 mt-1 max-w-xs mx-auto">Upload songs to start building your personal collection.</p>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-4 animate-pulse mt-4">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-4 bg-gray-100 rounded" />
                <div className="w-10 h-10 bg-gray-100 rounded-md" />
                <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-gray-100 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                </div>
            </div>
        ))}
    </div>
  );
}
