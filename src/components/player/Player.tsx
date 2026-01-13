"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/lib/store";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, ListMusic } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ArtistList } from "@/components/ArtistList";

export function Player() {
  const {
    activeSong,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    toggleQueue,
    isQueueOpen
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Constants for Smooth Fade
  const FADE_DURATION = 800; // ms
  const FADE_STEPS = 20;

  // 1. COMPLEX PLAY/PAUSE LOGIC (Smooth Fade)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSong) return;

    // Clear any active fades to prevent conflicts
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const stepTime = FADE_DURATION / FADE_STEPS;
    const targetVolume = isMuted ? 0 : volume;
    const volumeStep = targetVolume / FADE_STEPS;

    if (isPlaying) {
      // --- FADE IN ---
      audio.volume = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          let currentFadeVol = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentFadeVol += volumeStep;

            if (currentFadeVol >= targetVolume) {
              audio.volume = targetVolume;
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            } else {
              audio.volume = currentFadeVol;
            }
          }, stepTime);
        }).catch(err => console.error("Playback error:", err));
      }

    } else {
      // --- FADE OUT ---
      let currentFadeVol = audio.volume;

      fadeIntervalRef.current = setInterval(() => {
        currentFadeVol -= volumeStep;

        if (currentFadeVol <= 0) {
          audio.volume = 0;
          audio.pause();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

          // Reset volume for next play
          audio.volume = targetVolume;
        } else {
          audio.volume = currentFadeVol;
        }
      }, stepTime);
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isPlaying, activeSong, volume, isMuted]);

  // 2. Handle Volume Updates (When dragging slider)
  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Standard Audio Events
  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!activeSong) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 py-2 md:py-3 px-4 md:px-8 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all animate-in slide-in-from-bottom-10 duration-500">

      <audio
        ref={audioRef}
        src={activeSong.fileUrl}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={playNext}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: Song Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-[120px]">
          <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-md border border-gray-100 group transition-all duration-500 ${isPlaying ? "shadow-indigo-500/20" : ""}`}>
             <Image
              src={activeSong.coverUrl}
              alt={activeSong.name}
              fill
              className={`object-cover transition-transform duration-[3000ms] ease-linear ${isPlaying ? "scale-110" : "scale-100"}`}
            />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h4 className="font-bold text-gray-900 truncate text-sm leading-tight">{activeSong.name}</h4>
            <div className="text-xs text-gray-500 truncate font-medium mt-0.5">
              <ArtistList artists={activeSong.artist} />
          </div>
          </div>
        </div>

        {/* Center: Controls */}
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

          {/* Progress Bar (Hidden on very small screens, visible on md) */}
          <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-medium group">
            <span className="w-10 text-right tabular-nums">{formatDuration(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <span className="w-10 tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Queue */}
        <div className="flex items-center justify-end gap-3 w-1/3 min-w-[120px] group">

            {/* NEW: Queue Toggle Button */}
            <button
                onClick={toggleQueue}
                className={`hidden md:block p-2 rounded-full transition-all ${isQueueOpen ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                title="View Queue"
            >
                <ListMusic size={20} />
            </button>

            <div className="h-6 w-px bg-gray-200 hidden md:block" />

            {/* Mute Button */}
            <button onClick={toggleMute} className="text-gray-400 hover:text-gray-900 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Volume Slider */}
            <div className="w-24 hidden md:block">
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-400 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-gray-600 transition-all"
                />
            </div>

            {/* Close Button (Mobile Only) */}
            <button
                onClick={() => setIsPlaying(false)}
                className="md:hidden text-gray-400 ml-2"
            >
                <X size={20} />
            </button>
        </div>

      </div>
    </div>
  );
}
