"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Sparkles, ChevronRight, LayoutGrid, ChevronLeft } from "lucide-react";
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

const groupSongsByMood = (songs: Song[]) => {
  const groups: Record<string, Song[]> = {};
  songs.forEach((song) => {
    const mood = song.mood || "Chill";
    if (!groups[mood]) groups[mood] = [];
    groups[mood].push(song);
  });
  return groups;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeSong, isPlaying, playSmart, setQueue } = usePlayer();

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

  const moodSections = groupSongsByMood(songs);
  const moodOrder = ["Party", "Chill", "Romantic", "Focus", "Workout", "Sad", "Happy"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32 md:pb-32">

      {/* Header */}
      <div className="px-6 md:px-8 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Discover</h1>
            <p className="text-gray-500 font-medium mt-1">Top picks for you today</p>
          </div>
          <Link
            href="/library"
            className="hidden md:flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Go to Library <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="px-0 md:px-8 lg:px-10 pb-6 space-y-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Featured Hero - Added horizontal margin (mx-6) for mobile padding */}
              {featuredSong && (
                 <div className="mx-6 md:mx-0 relative overflow-hidden rounded-2xl md:rounded-3xl bg-gray-900 shadow-xl group cursor-pointer transition-transform duration-500 hover:shadow-2xl">
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-black/50 z-10" />
                      <div
                        className="absolute inset-0 bg-cover bg-center transform scale-110 opacity-60 transition-transform duration-[2s] group-hover:scale-100"
                        style={{ backgroundImage: `url(${featuredSong.blurDataUrl || featuredSong.coverUrl})` }}
                      />
                    </div>

                    <div className="relative z-20 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                      <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border-2 border-white/20">
                         <Image src={featuredSong.coverUrl} alt={featuredSong.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/10">
                            <Sparkles size={12} className="text-yellow-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{featuredSong.mood || "Trending"} Hit</span>
                         </div>
                         <h2 className="text-2xl md:text-5xl font-black text-white mb-2 leading-tight">{featuredSong.name}</h2>
                         <div className="text-gray-300 font-medium mb-6 text-lg">
                            <ArtistList artists={featuredSong.artist} className="text-gray-300 hover:text-white" />
                         </div>

                         <button
                            onClick={() => playSmart(featuredSong)}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center md:justify-start gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/30 active:scale-95 mx-auto md:mx-0"
                          >
                            {isCurrentSong(featuredSong._id)
                                ? <><Pause size={20} fill="currentColor" /> Pause Track</>
                                : <><Play size={20} fill="currentColor" /> Play Now</>
                            }
                         </button>
                      </div>
                    </div>
                 </div>
              )}

              {/* Sections */}
              <div className="space-y-12">

                {/* Fresh Arrivals */}
                <Section
                    title="Fresh Arrivals"
                    songs={songs.slice(0, 10)}
                    isCurrentSong={isCurrentSong}
                    playSmart={playSmart}
                />

                {/* Mood Categories */}
                {moodOrder.map((mood) => {
                  const moodSongs = moodSections[mood];
                  if (!moodSongs || moodSongs.length === 0) return null;

                  return (
                    <Section
                      key={mood}
                      title={`${mood} Vibes`}
                      mood={mood}
                      songs={moodSongs}
                      isCurrentSong={isCurrentSong}
                      playSmart={playSmart}
                    />
                  );
                })}
              </div>

              {/* Footer CTA */}
              <div className="flex justify-center pt-8 pb-4">
                 <Link
                    href="/library"
                    className="flex flex-col items-center gap-3 text-gray-400 hover:text-indigo-600 transition-colors group"
                 >
                    <div className="p-4 bg-gray-100 rounded-full group-hover:bg-indigo-50 transition-colors">
                        <LayoutGrid size={24} />
                    </div>
                    <span className="font-bold text-sm">View Full Library</span>
                 </Link>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- UPDATED SECTION COMPONENT ---
function Section({
    title,
    mood,
    songs,
    isCurrentSong,
    playSmart
}: {
    title: string,
    mood?: string,
    songs: Song[],
    isCurrentSong: (id: string) => boolean,
    playSmart: (s: Song) => void
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 1. New State to track visibility of arrows
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const displayedSongs = songs.slice(0, 10);
    const hasMore = songs.length > 10;

    // 2. Logic to check scroll position
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeft(scrollLeft > 0);
            // Tolerance of 2px for rounding errors
            setShowRight(scrollLeft < scrollWidth - clientWidth - 2);
        }
    };

    // 3. Listeners
    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [displayedSongs]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="space-y-4 group/section relative">
            {/* Header: Added px-6 for mobile padding alignment */}
            <div className="px-6 md:px-0 flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>

                {mood && (
                    <Link
                        href={`/category/${mood}`}
                        className="text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                        View All <ChevronRight size={14} />
                    </Link>
                )}
            </div>

            {/* Scroll Buttons - Conditionally Rendered */}
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:group-hover/section:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                    style={{ marginLeft: '-20px' }}
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:group-hover/section:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                    style={{ marginRight: '-20px' }}
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* List: Added px-6 for mobile padding */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex overflow-x-auto pb-4 pt-2 px-6 md:px-0 gap-4 md:gap-6 snap-x no-scrollbar scroll-smooth"
            >
                {displayedSongs.map((song) => (
                    <div
                        key={song._id}
                        onClick={() => playSmart(song)}
                        className="flex-shrink-0 w-36 md:w-48 snap-start group cursor-pointer"
                    >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-200 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                            <Image
                                src={song.coverUrl}
                                alt={song.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized
                            />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
                                ${isCurrentSong(song._id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                            `}>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg transform hover:scale-110 transition-transform">
                                    {isCurrentSong(song._id) ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm md:text-base truncate ${isCurrentSong(song._id) ? "text-indigo-600" : "text-gray-900"}`}>
                                {song.name}
                            </h4>
                            <div className="text-xs md:text-sm text-gray-500 truncate mt-0.5 font-medium relative z-10">
                                <ArtistList artists={song.artist} />
                            </div>
                        </div>
                    </div>
                ))}

                {/* 'More' Card */}
                {hasMore && mood && (
                    <Link
                        href={`/category/${mood}`}
                        className="flex-shrink-0 w-36 md:w-48 snap-start group cursor-pointer flex flex-col justify-center items-center text-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ChevronRight size={24} />
                        </div>
                        <span className="font-bold text-sm text-gray-600 group-hover:text-indigo-700">View All</span>
                    </Link>
                )}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-12 animate-pulse px-6 md:px-0">
      <div className="bg-gray-200 rounded-3xl h-[400px]" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="flex gap-4 overflow-hidden">
             {[...Array(5)].map((_,i) => <div key={i} className="w-40 h-56 bg-gray-100 rounded-xl flex-shrink-0" />)}
        </div>
      </div>
    </div>
  );
}
