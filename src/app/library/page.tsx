"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Clock, Music2, Disc, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/lib/store";
import { ArtistList } from "@/components/ArtistList";

interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
  mood?: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true); // Initial page load
  const [fetchingMore, setFetchingMore] = useState(false); // Background scroll load
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Ref for the "scroll trigger" element at the bottom
  const observerTarget = useRef<HTMLDivElement>(null);

  const { setActiveSong, activeSong, isPlaying, playSmart } = usePlayer();

  // Function to fetch data
  const fetchSongs = useCallback(async (pageNum: number) => {
      try {
        const res = await fetch(`/api/songs?page=${pageNum}&limit=20`);
        const data = await res.json();

        if (data.songs) {
            setSongs((prev) => {
                // If page 1, replace. If page > 1, append.
                if (pageNum === 1) return data.songs;
                // Avoid duplicates using Set (safety check)
                const existingIds = new Set(prev.map(s => s._id));
                const newUniqueSongs = data.songs.filter((s: Song) => !existingIds.has(s._id));
                return [...prev, ...newUniqueSongs];
            });
            setHasMore(data.hasMore);
            setTotalCount(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch library", error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
  }, []);

  // 1. Initial Load
  useEffect(() => {
    fetchSongs(1);
  }, [fetchSongs]);

  // 2. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingMore && !loading) {
          setFetchingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchSongs(nextPage);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, fetchingMore, loading, page, fetchSongs]);


  const handlePlay = (song: Song) => {
    playSmart(song);
  };

  const isCurrentSong = (id: string) => activeSong?._id === id;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* 1. Large Header */}
      <div className="relative w-full bg-gradient-to-b from-indigo-50 to-white px-6 md:px-10 pt-10 pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 max-w-7xl mx-auto">
          {/* Cover Art Icon */}
          <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl flex items-center justify-center text-white shadow-indigo-200 flex-shrink-0">
            <Music2 size={80} className="drop-shadow-lg" />
          </div>

          <div className="flex flex-col gap-2 text-center md:text-left flex-1">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-600">My Collection</span>
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
              Library
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-medium text-sm mt-2">
              <div className="flex items-center gap-1">
                 <Disc size={16} />
                 <span className="font-bold text-gray-900">{totalCount}</span> songs
              </div>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Personal Playlist</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Song List */}
      <div className="px-2 md:px-6 lg:px-10 max-w-7xl mx-auto">

        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 mb-2">
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 text-xs font-bold uppercase tracking-wider text-gray-400 px-4">
                <div className="w-8 text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Artist</div>
                <div className="text-right pr-2"><Clock size={16} /></div>
            </div>
        </div>

        {/* Content */}
        <div className="py-2">
            {loading && songs.length === 0 ? (
                <LibrarySkeleton />
            ) : songs.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-1">
                    {songs.map((song, index) => {
                    const isActive = isCurrentSong(song._id);
                    const isPlayingActive = isActive && isPlaying;

                    return (
                        <div
                        key={song._id}
                        onClick={() => handlePlay(song)}
                        className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                            ${isActive
                            ? "bg-indigo-50 shadow-sm"
                            : "hover:bg-gray-50 hover:shadow-sm"
                            }
                        `}
                        >
                        {/* 1. Index / Play Btn */}
                        <div className="w-8 flex justify-center text-gray-400 font-medium text-sm">
                            <span className={`group-hover:hidden ${isActive ? "hidden" : "block"}`}>
                            {index + 1}
                            </span>

                            {isActive && isPlaying && (
                                <div className="flex items-end gap-[2px] h-4 block group-hover:hidden">
                                    <div className="w-1 bg-indigo-600 animate-music-bar-1 h-full" />
                                    <div className="w-1 bg-indigo-600 animate-music-bar-2 h-full" />
                                    <div className="w-1 bg-indigo-600 animate-music-bar-3 h-full" />
                                </div>
                            )}
                            {isActive && !isPlaying && (
                                <span className="text-indigo-600 font-bold block group-hover:hidden">{index + 1}</span>
                            )}

                            <span className={`hidden group-hover:block ${isActive ? "text-indigo-600" : "text-gray-800"}`}>
                            {isPlayingActive ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                            </span>
                        </div>

                        {/* 2. Title & Art */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                            <Image
                                src={song.coverUrl}
                                alt={song.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            </div>
                            <div className="min-w-0">
                            <h3 className={`font-semibold truncate text-sm md:text-base ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                                {song.name}
                            </h3>
                            <div className="md:hidden text-xs text-gray-500 truncate mt-0.5">
                                <ArtistList artists={song.artist} />
                            </div>
                            </div>
                        </div>

                        {/* 3. Artist (Desktop Only) */}
                        <div className="hidden md:flex text-sm text-gray-500 font-medium items-center gap-2 truncate group-hover:text-gray-900 transition-colors">
                            <ArtistList artists={song.artist} />
                        </div>

                        {/* 4. Duration */}
                        <div className="text-sm text-gray-400 font-medium tabular-nums text-right pr-2">
                            {formatDuration(song.duration)}
                        </div>

                        </div>
                    );
                    })}

                    {/* Infinite Scroll Trigger */}
                    {hasMore && (
                        <div ref={observerTarget} className="flex justify-center py-6">
                             <Loader2 className="animate-spin text-indigo-600" />
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-4 animate-pulse mt-2">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-4 bg-gray-100 rounded" />
                <div className="w-11 h-11 bg-gray-100 rounded-md" />
                <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-gray-100 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                </div>
            </div>
        ))}
    </div>
  );
}
