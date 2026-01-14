"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Play, Pause, Mic2, ArrowLeft, Clock, CheckCircle2, Music, UserPlus, MoreHorizontal } from "lucide-react";
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

export default function ArtistPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const artistName = decodeURIComponent(name);

  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const { activeSong, isPlaying, playSmart, setQueue, setActiveSong, setIsPlaying } = usePlayer();

  useEffect(() => {
    async function fetchArtistSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();

        if (data.songs) {
          // Filter songs where ANY of the artists match
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
      setQueue(songs);
      setActiveSong(songs[0]);
      setIsPlaying(true);
    }
  };

  // Generate a random "Monthly Listeners" count based on name length for demo consistency
  const listeners = (artistName.length * 842193).toLocaleString();

  if (loading) return <ArtistSkeleton />;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* 1. Immersive Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[340px] bg-gradient-to-b from-slate-800 via-gray-900 to-black overflow-hidden flex flex-col justify-end p-6 md:p-10 text-white">

        {/* Abstract Background Art */}
        <div className="absolute inset-0 opacity-40">
             <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] bg-indigo-600 rounded-full blur-[120px] mix-blend-screen opacity-20" />
             <div className="absolute top-[20%] right-[0%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] mix-blend-screen opacity-10" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all z-20"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-8">
            {/* Artist Avatar (Circle) */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 shadow-2xl overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0 relative group">
                {songs.length > 0 ? (
                    <Image src={songs[0].coverUrl} alt={artistName} fill className="object-cover" />
                ) : (
                    <Mic2 size={48} className="text-gray-400" />
                )}
            </div>

            <div className="flex-1 mb-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <CheckCircle2 size={18} fill="currentColor" className="text-blue-500 text-white" />
                    <span className="text-white/90">Verified Artist</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 text-white drop-shadow-lg leading-none">
                    {artistName}
                </h1>
                <p className="text-white/70 font-medium text-base md:text-lg">
                    {listeners} monthly listeners
                </p>
            </div>
        </div>
      </div>

      {/* 2. Sticky Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4 flex items-center gap-4 shadow-sm transition-all">
         <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-105 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {activeSong && songs.some(s => s._id === activeSong._id) && isPlaying
                ? <Pause size={28} fill="currentColor" />
                : <Play size={28} fill="currentColor" className="ml-1" />
            }
         </button>

         <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-2 rounded-full font-bold text-sm border transition-all
                ${isFollowing
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                    : "border-gray-300 text-gray-700 hover:border-gray-800 hover:text-black"
                }
            `}
         >
            {isFollowing ? "Following" : "Follow"}
         </button>

         <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
             <MoreHorizontal size={24} />
         </button>
      </div>

      {/* 3. Popular Songs List */}
      <div className="px-2 md:px-6 lg:px-10 py-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-4">Popular</h2>

        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 px-4 py-2 text-xs font-bold text-gray-400 border-b border-gray-100 mb-2 uppercase tracking-wider">
            <div className="w-8 text-center">#</div>
            <div>Title</div>
            <div className="hidden md:block">Plays</div>
            <div className="text-right pr-2"><Clock size={14} /></div>
        </div>

        <div className="space-y-1">
            {songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                    <Music size={48} className="opacity-20" />
                    <p>No tracks released yet.</p>
                </div>
            ) : (
                songs.map((song, index) => {
                    const isActive = isCurrentSong(song._id);
                    // Fake play count logic for demo
                    const plays = ((songs.length - index) * 123456 + 50000).toLocaleString();

                    return (
                        <div
                            key={song._id}
                            onClick={() => playSmart(song)}
                            className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer transition-all
                                ${isActive ? "bg-indigo-50" : "hover:bg-gray-100"}
                            `}
                        >
                            {/* 1. Number / Play Icon */}
                            <div className="w-8 flex justify-center text-sm font-medium text-gray-500 relative">
                                {isActive && isPlaying ? (
                                    <div className="flex items-end gap-[2px] h-4">
                                        <div className="w-1 bg-indigo-600 animate-music-bar-1 h-full" />
                                        <div className="w-1 bg-indigo-600 animate-music-bar-2 h-full" />
                                        <div className="w-1 bg-indigo-600 animate-music-bar-3 h-full" />
                                    </div>
                                ) : (
                                    <>
                                        <span className={`group-hover:hidden ${isActive ? "text-indigo-600" : ""}`}>{index + 1}</span>
                                        <Play size={16} className="hidden group-hover:block text-gray-900" fill="currentColor" />
                                    </>
                                )}
                            </div>

                            {/* 2. Title & Art */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                    <Image src={song.coverUrl} alt={song.name} fill className="object-cover" unoptimized />
                                </div>
                                <div className="min-w-0">
                                    <h3 className={`font-semibold truncate text-[15px] ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                                        {song.name}
                                    </h3>
                                    {/* Show explicit badge if needed (optional) */}
                                </div>
                            </div>

                            {/* 3. Plays (Desktop Only) */}
                            <div className="hidden md:block text-sm text-gray-500 font-medium tabular-nums">
                                {plays}
                            </div>

                            {/* 4. Duration */}
                            <div className="text-sm text-gray-400 font-medium tabular-nums text-right pr-2">
                                {formatDuration(song.duration)}
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
            <div className="h-[45vh] bg-gray-800 w-full" />
            <div className="p-8 space-y-4 max-w-7xl mx-auto">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg w-full" />
                ))}
            </div>
        </div>
    )
}
