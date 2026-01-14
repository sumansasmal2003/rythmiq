"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  Play,
  Pause,
  X,
  Clock,
  Filter,
  Music2
} from "lucide-react";
import { usePlayer } from "@/lib/store";
import { ArtistList } from "@/components/ArtistList";
import { formatDuration } from "@/lib/utils";

interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
  mood?: string;
}

const MOODS = ["Party", "Chill", "Sad", "Happy", "Romantic", "Focus", "Workout"];
const DURATIONS = [
    { label: "Any Length", value: "all" },
    { label: "Short (< 3m)", value: "short" },
    { label: "Medium (3-5m)", value: "medium" },
    { label: "Long (> 5m)", value: "long" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("all");

  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeSong, isPlaying, playSmart } = usePlayer();
  const isCurrentSong = (id: string) => activeSong?._id === id && isPlaying;

  // 1. Fetch Songs
  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (data.songs) {
          setSongs(data.songs);
          setFilteredSongs(data.songs);
        }
      } catch (error) {
        console.error("Failed to fetch songs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  // 2. Filter Logic (Runs whenever inputs change)
  useEffect(() => {
    let result = songs;

    // A. Text Search (Name or Artist)
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(song =>
        song.name.toLowerCase().includes(lowerQuery) ||
        song.artist.some(a => a.toLowerCase().includes(lowerQuery))
      );
    }

    // B. Mood Filter
    if (selectedMood) {
      result = result.filter(song => song.mood === selectedMood);
    }

    // C. Duration Filter
    if (selectedDuration !== "all") {
        result = result.filter(song => {
            if (selectedDuration === "short") return song.duration < 180; // < 3 min
            if (selectedDuration === "medium") return song.duration >= 180 && song.duration <= 300; // 3-5 min
            if (selectedDuration === "long") return song.duration > 300; // > 5 min
            return true;
        });
    }

    setFilteredSongs(result);
  }, [query, selectedMood, selectedDuration, songs]);

  // Handlers
  const clearFilters = () => {
      setQuery("");
      setSelectedMood(null);
      setSelectedDuration("all");
  };

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* 1. Search Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">

            {/* Input Bar */}
            <div className="relative group">
                <SearchIcon className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="What do you want to listen to?"
                    className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full py-3.5 pl-12 pr-12 text-gray-900 font-medium placeholder:text-gray-500 transition-all outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">

                {/* Mood Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar mask-gradient">
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
                        <Filter size={12} /> Mood
                    </span>
                    {MOODS.map(mood => (
                        <button
                            key={mood}
                            onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                                ${selectedMood === mood
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                }
                            `}
                        >
                            {mood}
                        </button>
                    ))}
                </div>

                {/* Duration Dropdown (Simple Select for Utility) */}
                <div className="flex items-center gap-2 shrink-0">
                     <span className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <Clock size={12} /> Time
                    </span>
                    <select
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {DURATIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Results List */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Results Count / Reset */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
                {filteredSongs.length} results
            </h2>
            {(query || selectedMood || selectedDuration !== "all") && (
                <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                    Clear All
                </button>
            )}
        </div>

        <div className="space-y-2">
            {loading ? (
                <SearchSkeleton />
            ) : filteredSongs.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Music2 size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No songs found matching your filters.</p>
                    <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold hover:underline">
                        Reset Filters
                    </button>
                </div>
            ) : (
                filteredSongs.map((song) => {
                    const isActive = isCurrentSong(song._id);
                    return (
                        <div
                            key={song._id}
                            onClick={() => playSmart(song)}
                            className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border border-transparent
                                ${isActive
                                    ? "bg-indigo-50 border-indigo-100 shadow-sm"
                                    : "hover:bg-gray-50 hover:border-gray-100"
                                }
                            `}
                        >
                            {/* Art */}
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 group-hover:shadow-md transition-all">
                                <Image src={song.coverUrl} alt={song.name} fill className="object-cover" unoptimized />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity
                                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                `}>
                                    {isActive ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate text-base ${isActive ? "text-indigo-600" : "text-gray-900"}`}>
                                    {song.name}
                                </h3>
                                <div className="text-sm text-gray-500 truncate flex items-center gap-2">
                                    <ArtistList artists={song.artist} />
                                    {song.mood && (
                                        <>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                                                {song.mood}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="text-sm text-gray-400 font-medium tabular-nums px-2">
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

function SearchSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl w-full" />
            ))}
        </div>
    )
}
