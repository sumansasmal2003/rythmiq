"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Play, Pause, ArrowLeft, Disc, Clock, Music } from "lucide-react";
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

export default function CategoryPage({ params }: { params: Promise<{ mood: string }> }) {
  const { mood } = use(params);
  const categoryName = decodeURIComponent(mood);

  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeSong, isPlaying, playSmart, setQueue, setActiveSong, setIsPlaying } = usePlayer();

  useEffect(() => {
    async function fetchCategorySongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();

        if (data.songs) {
          const filtered = data.songs.filter((s: Song) =>
            (s.mood || "Chill") === categoryName
          );
          setSongs(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch songs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategorySongs();
  }, [categoryName]);

  const isCurrentSong = (id: string) => activeSong?._id === id && isPlaying;

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
      setActiveSong(songs[0]);
      setIsPlaying(true);
    }
  };

  // --- NEW: Calculate Total Duration ---
  const totalDurationSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);

  const formatTotalDuration = (seconds: number) => {
      if (!seconds) return "0 min";

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
          return `${hours} hr ${minutes} min`;
      }
      return `${minutes} min`;
  };
  // -------------------------------------

  const getGradient = (mood: string) => {
     switch(mood) {
         case "Party": return "from-purple-700 via-purple-900 to-black";
         case "Sad": return "from-blue-700 via-slate-800 to-black";
         case "Happy": return "from-yellow-500 via-orange-600 to-black";
         case "Workout": return "from-red-600 via-rose-900 to-black";
         case "Focus": return "from-teal-600 via-emerald-900 to-black";
         case "Romantic": return "from-pink-600 via-rose-900 to-black";
         default: return "from-gray-600 via-slate-800 to-black";
     }
  };

  if (loading) return <CategorySkeleton />;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* Immersive Header */}
      <div className={`relative w-full h-[40vh] min-h-[300px] bg-gradient-to-b ${getGradient(categoryName)} flex flex-col justify-end p-6 md:p-10 text-white transition-colors duration-700`}>

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all z-20"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-8">
            <div className="w-32 h-32 md:w-52 md:h-52 shadow-2xl shadow-black/40 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                {songs.length > 0 ? (
                    <Image
                        src={songs[0].coverUrl}
                        alt={categoryName}
                        width={208}
                        height={208}
                        className="object-cover w-full h-full"
                        unoptimized // Security fix
                    />
                ) : (
                    <Disc size={64} className="text-white/50" />
                )}
            </div>

            <div className="flex-1 mb-2">
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-2 opacity-90">Mood Playlist</p>
                <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4">{categoryName}</h1>
                <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                    <span>Rythmiq Mix</span>
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span>{songs.length} songs</span>
                    <span className="w-1 h-1 bg-white rounded-full" />

                    {/* DYNAMIC DURATION DISPLAY */}
                    <span className="opacity-70">About {formatTotalDuration(totalDurationSeconds)}</span>
                </div>
            </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
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
             <div className="hidden md:block">
                 <h3 className="font-bold text-gray-900 text-lg">{categoryName}</h3>
             </div>
         </div>
      </div>

      {/* Song List */}
      <div className="px-2 md:px-6 lg:px-10 py-4 max-w-7xl mx-auto">

        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 px-4 py-2 text-sm font-medium text-gray-400 border-b border-gray-100 mb-2 uppercase tracking-wider">
            <div className="w-8 text-center">#</div>
            <div>Title</div>
            <div className="hidden md:block">Artist</div>
            <div className="text-right pr-2"><Clock size={16} /></div>
        </div>

        {/* Rows */}
        <div className="space-y-1">
            {songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                    <Music size={48} className="opacity-20" />
                    <p>No tracks found for this mood yet.</p>
                </div>
            ) : (
                songs.map((song, index) => {
                    const isActive = isCurrentSong(song._id);

                    return (
                        <div
                            key={song._id}
                            onClick={() => playSmart(song)}
                            className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_4fr_3fr_auto] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer transition-all
                                ${isActive ? "bg-indigo-50" : "hover:bg-gray-100"}
                            `}
                        >
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

                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                    <Image src={song.coverUrl} alt={song.name} fill className="object-cover" unoptimized />
                                </div>
                                <div className="min-w-0">
                                    <h3 className={`font-semibold truncate text-[15px] ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                                        {song.name}
                                    </h3>
                                    <div className="md:hidden text-xs text-gray-500 truncate mt-0.5">
                                        {song.artist.join(", ")}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center text-sm text-gray-500 font-medium truncate group-hover:text-gray-900 transition-colors">
                                <ArtistList artists={song.artist} />
                            </div>

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

function CategorySkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-[40vh] bg-gray-200 w-full" />
            <div className="p-8 space-y-4 max-w-7xl mx-auto">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg w-full" />
                ))}
            </div>
        </div>
    )
}
