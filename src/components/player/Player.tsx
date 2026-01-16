"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/lib/store";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Maximize2,
  ChevronDown,
  Mic2
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ArtistList } from "@/components/ArtistList";
import { LyricsPanel } from "@/components/LyricsPanel";
// Import the new Visualizer component
import { AudioVisualizer } from "./AudioVisualizer";

export function Player() {
  const {
    activeSong,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    toggleQueue,
    isQueueOpen,
    queue,
    playSmart
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- VISUALIZER STATE ---
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // --- 1. SETUP AUDIO GRAPH (VISUALIZER) ---
  useEffect(() => {
    if (!audioRef.current) return;

    // Initialize AudioContext only when playing starts (browser policy requires user gesture)
    if (isPlaying && !audioContextRef.current) {
        // Cross-browser support
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const anal = ctx.createAnalyser();

        // Create source from the existing <audio> element
        const source = ctx.createMediaElementSource(audioRef.current);

        // Connect: Source -> Analyser -> Destination (Speakers)
        source.connect(anal);
        anal.connect(ctx.destination);

        audioContextRef.current = ctx;
        sourceRef.current = source;
        setAnalyser(anal);
    }

    // Resume context if suspended (common browser fix)
    if (isPlaying && audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
    }
  }, [isPlaying]);

  // --- 2. MEDIA SESSION API ---
  useEffect(() => {
    if (!activeSong || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeSong.name,
      artist: activeSong.artist.join(", "),
      artwork: [
        { src: activeSong.coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: activeSong.coverUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: activeSong.coverUrl, sizes: '512x512', type: 'image/jpeg' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);

    return () => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
        }
    };
  }, [activeSong, setIsPlaying, playPrevious, playNext]);


  // --- 3. AUDIO PLAYBACK LOGIC ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSong) return;

    audio.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed (autoplay policy):", error);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, activeSong]); // Volume handled separately below

  // --- 4. SEPARATE VOLUME LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);


  // --- 5. EVENT HANDLERS ---
  const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  if (!activeSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={activeSong.fileUrl}
        crossOrigin="anonymous" /* CRITICAL: Required for Visualizer to read frequency data */
        autoPlay={isPlaying}
        playsInline
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={playNext}
      />

      <LyricsPanel isOpen={showLyrics} onClose={() => setShowLyrics(false)} />

      {/* FULL SCREEN OVERLAY */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-md relative z-20">
             <button onClick={() => setIsFullScreen(false)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <ChevronDown size={28} />
             </button>
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Now Playing</span>
             <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`p-2 rounded-full transition-colors ${showLyrics ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100"}`}
             >
                <Mic2 size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">

             {/* LEFT: Cover Art & Visualizer */}
             <div className="flex-1 flex flex-col items-center justify-center p-8 md:border-r border-gray-100 bg-gray-50/30 relative overflow-hidden">

                {/* --- VISUALIZER COMPONENT --- */}
                {analyser && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 w-full z-0 pointer-events-none">
                         <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
                    </div>
                )}

                <div className="relative w-full max-w-sm aspect-square shadow-2xl rounded-2xl overflow-hidden mb-8 z-10 border-4 border-white">
                   <Image
                     src={activeSong.coverUrl}
                     alt={activeSong.name}
                     fill
                     className="object-cover"
                     unoptimized
                   />
                </div>

                <div className="text-center space-y-2 z-10 relative">
                   <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight drop-shadow-sm">{activeSong.name}</h2>
                   <div className="text-lg md:text-xl text-gray-500 font-medium">
                       <ArtistList artists={activeSong.artist} />
                   </div>
                </div>
             </div>

             {/* RIGHT: Queue List */}
             <div className="flex-1 flex flex-col bg-white h-full overflow-hidden z-20">
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ListMusic size={20} className="text-indigo-600"/> Up Next
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {queue.map((song, i) => (
                        <div
                            key={i}
                            onClick={() => playSmart(song)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                                ${activeSong._id === song._id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50"}
                            `}
                        >
                             <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={song.coverUrl} alt={song.name} fill className="object-cover" unoptimized />
                                {activeSong._id === song._id && isPlaying && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-1 h-3 bg-white mx-0.5 animate-bounce" />
                                        <div className="w-1 h-3 bg-white mx-0.5 animate-bounce [animation-delay:0.1s]" />
                                    </div>
                                )}
                             </div>
                             <div className="min-w-0">
                                 <h4 className={`text-sm font-bold truncate ${activeSong._id === song._id ? "text-indigo-600" : "text-gray-900"}`}>{song.name}</h4>
                                 <p className="text-xs text-gray-500 truncate">{song.artist.join(", ")}</p>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          {/* CONTROLS FOOTER */}
          <div className="px-6 py-6 md:px-12 md:py-8 bg-white border-t border-gray-100 relative z-20">
             <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mb-6">
                <span className="w-10 text-right">{formatDuration(currentTime)}</span>
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                />
                <span className="w-10">{formatDuration(duration)}</span>
             </div>

             <div className="flex items-center justify-center gap-10">
                 <button onClick={playPrevious} className="p-4 rounded-full hover:bg-gray-100 text-gray-900 transition-all active:scale-95">
                    <SkipBack size={32} fill="currentColor" />
                 </button>
                 <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-300 hover:scale-105 active:scale-95 transition-all"
                 >
                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                 </button>
                 <button onClick={playNext} className="p-4 rounded-full hover:bg-gray-100 text-gray-900 transition-all active:scale-95">
                    <SkipForward size={32} fill="currentColor" />
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* MINI PLAYER (Bottom Bar) */}
      <div
        className={`fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-500
            ${isFullScreen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer">
            <div className="absolute inset-0 bg-gray-200" />
            <div
                className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-100 ease-linear"
                style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>

        <div className="max-w-7xl mx-auto py-2 md:py-3 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-1/3 min-w-[120px]">
            <div
                onClick={() => setIsFullScreen(true)}
                className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-md border border-gray-100 cursor-pointer group"
            >
               <Image
                src={activeSong.coverUrl}
                alt={activeSong.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />
            </div>
            <div className="hidden md:block overflow-hidden">
              <h4 className="font-bold text-gray-900 truncate text-sm leading-tight">{activeSong.name}</h4>
              <div className="text-xs text-gray-500 truncate font-medium mt-0.5">
                <ArtistList artists={activeSong.artist} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-4 md:gap-6">
              <button
                  onClick={playPrevious}
                  className="text-gray-400 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-black active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>

              <button
                  onClick={playNext}
                  className="text-gray-400 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-1/3 min-w-[120px] group">
              <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`hidden md:block p-2 rounded-full transition-all ${showLyrics ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                  title="Lyrics"
              >
                  <Mic2 size={20} />
              </button>

              <button
                  onClick={toggleQueue}
                  className={`hidden md:block p-2 rounded-full transition-all ${isQueueOpen ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                  title="View Queue"
              >
                  <ListMusic size={20} />
              </button>

              <div className="h-6 w-px bg-gray-200 hidden md:block mx-1" />

              <button onClick={toggleMute} className="text-gray-400 hover:text-gray-900 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <div className="w-24 hidden md:block">
                  <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
              </div>

              <button
                  onClick={() => setIsFullScreen(true)}
                  className="hidden md:block p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                  title="Full Screen Player"
              >
                  <Maximize2 size={20} />
              </button>

              <button
                  onClick={() => setIsPlaying(false)}
                  className="md:hidden text-gray-400 ml-2"
              >
                  <X size={20} />
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
