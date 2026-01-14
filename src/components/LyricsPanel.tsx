"use client";

import { useEffect, useState, useRef } from "react";
import { usePlayer } from "@/lib/store";
import { X, Mic2, Loader2, Music2, Minimize2 } from "lucide-react";

interface LyricLine {
  time: number;
  text: string;
}

export function LyricsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeSong } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref for auto-scrolling (optional future enhancement)
  const listRef = useRef<HTMLDivElement>(null);

  const parseLrc = (lrcString: string): LyricLine[] => {
    const lines = lrcString.split("\n");
    const result: LyricLine[] = [];
    const regex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    lines.forEach((line) => {
      const match = line.match(regex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = minutes * 60 + seconds + ms / 100;
        result.push({ time, text: match[4].trim() });
      }
    });
    return result;
  };

  useEffect(() => {
    if (!activeSong || !isOpen) return;

    const fetchLyrics = async () => {
      setLoading(true);
      setError("");
      setLyrics([]);

      try {
        const artist = activeSong.artist[0] || "";
        const title = activeSong.name;

        // 1. Strict Search
        const queryStrict = new URLSearchParams({ track_name: title, artist_name: artist });
        let res = await fetch(`https://lrclib.net/api/get?${queryStrict}`);

        // 2. Broad Search Fallback
        if (res.status === 404) {
             const queryBroad = new URLSearchParams({ q: `${title} ${artist}` });
             const searchRes = await fetch(`https://lrclib.net/api/search?${queryBroad}`);
             const searchData = await searchRes.json();

             if (Array.isArray(searchData) && searchData.length > 0) {
                 const bestMatch = searchData[0];
                 if (bestMatch.syncedLyrics) {
                     setLyrics(parseLrc(bestMatch.syncedLyrics));
                     return;
                 } else if (bestMatch.plainLyrics) {
                     setLyrics([{ time: 0, text: bestMatch.plainLyrics }]);
                     return;
                 }
             }
             setError("Lyrics not found.");
             return;
        }

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        if (data.syncedLyrics) {
          setLyrics(parseLrc(data.syncedLyrics));
        } else if (data.plainLyrics) {
          setLyrics([{ time: 0, text: data.plainLyrics }]);
        } else {
          setError("Lyrics not available.");
        }

      } catch (err) {
        setError("Could not load lyrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [activeSong, isOpen]);

  if (!isOpen) return null;

  return (
    // Z-Index 120 ensures it appears ABOVE the full screen player (usually z-100)
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 w-[90vw] md:w-96 h-[60vh] max-h-[500px] z-[120] bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-200">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-white">
            <Mic2 size={18} className="text-indigo-400" />
            <span className="font-bold text-sm tracking-wide">Lyrics</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-6 text-center space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-white/50 gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Syncing...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 gap-3">
            <Music2 size={32} />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="py-4">
            {lyrics.map((line, i) => (
              <p
                key={i}
                className="text-lg md:text-xl font-bold text-white/80 hover:text-white mb-6 transition-colors leading-relaxed cursor-default shadow-black drop-shadow-md"
              >
                {line.text}
              </p>
            ))}
            <div className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
