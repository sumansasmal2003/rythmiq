"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Pause, Sparkles, TrendingUp } from "lucide-react";
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
  blurDataUrl?: string;
  createdAt: string;
  mood?: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Import playSmart
  const { setActiveSong, activeSong, isPlaying, setQueue, playSmart } = usePlayer();

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (data.songs) {
          setSongs(data.songs);
          setQueue(data.songs);
        }
      } catch (error) {
        console.error("Failed to fetch songs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [setQueue]);

  const featuredSong = songs.length > 0 ? songs[0] : null;
  const isCurrentSong = (id: string) => activeSong?._id === id && isPlaying;

  const getMoodColor = (mood?: string) => {
      switch(mood) {
          case "Party": return "bg-purple-100 text-purple-700 border-purple-200";
          case "Sad": return "bg-blue-100 text-blue-700 border-blue-200";
          case "Happy": return "bg-yellow-100 text-yellow-700 border-yellow-200";
          case "Workout": return "bg-red-100 text-red-700 border-red-200";
          case "Focus": return "bg-teal-100 text-teal-700 border-teal-200";
          case "Romantic": return "bg-pink-100 text-pink-700 border-pink-200";
          default: return "bg-gray-100 text-gray-700 border-gray-200";
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32 md:pb-32">

      {/* 1. Header */}
      <div className="px-6 md:px-8 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Discover
            </h1>
            <p className="text-gray-600 font-medium text-base md:text-lg">
              Explore the latest sounds tailored for you.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* 3. Featured Hero */}
              {featuredSong && (
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl group cursor-pointer transition-transform duration-500 hover:shadow-indigo-500/20">
                  {/* Background */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transform scale-110 opacity-30 transition-transform duration-700 group-hover:scale-100"
                      style={{ backgroundImage: `url(${featuredSong.blurDataUrl || featuredSong.coverUrl})` }}
                    />
                  </div>

                  <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">

                      {/* Album Art */}
                      <div className="relative w-56 h-56 md:w-64 md:h-64 flex-shrink-0">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                          <Image
                            src={featuredSong.coverUrl}
                            alt={featuredSong.name}
                            fill
                            className="object-cover"
                            placeholder={featuredSong.blurDataUrl ? "blur" : "empty"}
                            blurDataURL={featuredSong.blurDataUrl}
                            priority
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/10">
                          <Sparkles size={14} className="text-yellow-300" />
                          <span className="text-sm font-semibold text-white">Featured Track • {featuredSong.mood}</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 tracking-tight">
                          {featuredSong.name}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 mb-6 font-medium opacity-90">
                          {featuredSong.artist.join(", ")}
                        </p>

                        {/* USE PLAYSMART HERE */}
                        <button
                          onClick={() => playSmart(featuredSong)}
                          className="group/btn bg-white text-gray-900 hover:bg-indigo-50 rounded-full px-8 py-4 font-bold flex items-center justify-center md:justify-start gap-3 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                            {isCurrentSong(featuredSong._id)
                                ? <Pause size={16} fill="currentColor" />
                                : <Play size={16} fill="currentColor" className="ml-0.5" />
                            }
                          </div>
                          <span>{isCurrentSong(featuredSong._id) ? "Playing" : "Play Now"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Music Grid Section */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Fresh Arrivals</h3>
                      <p className="text-gray-500 text-sm mt-0.5">Latest additions to your library</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {songs.map((song) => (
                    <div
                      key={song._id}
                      onClick={() => playSmart(song)} // <--- USE PLAYSMART HERE
                      className={`group bg-white rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl
                        ${isCurrentSong(song._id) ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg" : "border-gray-200 hover:border-indigo-200"}
                      `}
                    >
                      {/* Album Art */}
                      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100">
                        <Image
                          src={song.coverUrl}
                          alt={song.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          placeholder={song.blurDataUrl ? "blur" : "empty"}
                          blurDataURL={song.blurDataUrl}
                        />

                         {/* MOOD BADGE */}
                         <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${getMoodColor(song.mood)}`}>
                            {song.mood || "Chill"}
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md z-20">
                          {formatDuration(song.duration)}
                        </div>

                        {/* Play Button Overlay */}
                        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 z-10
                            ${isCurrentSong(song._id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                        `}>
                          <button className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform hover:bg-white text-black">
                            {isCurrentSong(song._id)
                                ? <Pause size={24} fill="currentColor" className="text-indigo-600" />
                                : <Play size={24} fill="currentColor" className="ml-1" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="p-4">
                        <h3 className={`font-bold truncate ...`}>
                            {song.name}
                        </h3>
                        {/* REPLACED PLAIN TEXT WITH THIS: */}
                        <div className="text-sm text-gray-500 truncate mt-1.5 font-medium relative z-20">
                            <ArtistList artists={song.artist} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="bg-gray-200 rounded-2xl md:rounded-3xl h-[400px] md:h-[450px]" />
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-lg w-10 h-10" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-9 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
