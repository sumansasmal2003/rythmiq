"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Play, Music } from "lucide-react";
import Image from "next/image";
import { usePlayer } from "@/lib/store";
import { useRouter } from "next/navigation";

interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const { setActiveSong, playSmart } = usePlayer();

  // 1. Debounce Logic: Wait 300ms after typing stops before calling API
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.songs || []);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // 2. Click Outside to Close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlay = (song: Song) => {
    playSmart(song);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Input Bar */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search for songs, artists..."
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true); }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (query.length > 0) && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">

          {isLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Top Results
              </div>
              {results.map((song) => (
                <div
                  key={song._id}
                  onClick={() => handlePlay(song)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image src={song.coverUrl} alt={song.name} fill className="object-cover" />
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white fill-current" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {song.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                        {song.artist.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-gray-400">
                <Music size={24} className="opacity-50" />
                <span className="text-sm">No songs found.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
