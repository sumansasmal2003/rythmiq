"use client";

import { usePlayer } from "@/lib/store";
import {
  Settings,
  Trash2,
  Volume2,
  Moon,
  Shield,
  Smartphone,
  ChevronRight,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { setQueue, setActiveSong, setIsPlaying } = usePlayer();

  // Functional: Clear the current music queue
  const handleClearQueue = () => {
    setQueue([]);
    setActiveSong(null!); // Force clear active song
    setIsPlaying(false);
    toast.success("Queue cleared successfully");
  };

  // Functional: Simulating a cache reset
  const handleClearCache = () => {
    toast.loading("Clearing cache...", { duration: 1000 });
    setTimeout(() => {
        toast.success("Cache cleared!");
        window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 font-medium">Manage your app preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Section 1: Audio */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Audio & Playback</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Volume2 size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Audio Quality</h3>
                  <p className="text-xs text-gray-500">Streaming quality set to High</p>
                </div>
              </div>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">High</span>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Zap size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Fading</h3>
                  <p className="text-xs text-gray-500">Crossfade between songs</p>
                </div>
              </div>
              {/* Toggle Switch (Visual) */}
              <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Storage & Data */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Data Management</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">

            <button
                onClick={handleClearQueue}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors"><Trash2 size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700">Clear Play Queue</h3>
                  <p className="text-xs text-gray-500 group-hover:text-red-500/80">Stop playback and remove all queued songs</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400" />
            </button>

            <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Smartphone size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reset App Cache</h3>
                  <p className="text-xs text-gray-500">Fixes sync issues by reloading the app</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>

          </div>
        </section>

        {/* Section 3: App Info */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Application</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Shield size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Version</h3>
                  <p className="text-xs text-gray-500">Rythmiq v1.0.0 (Beta)</p>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400">Build 2024.01</span>
            </div>

            <div className="flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Moon size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dark Mode</h3>
                  <p className="text-xs text-gray-500">Coming soon in next update</p>
                </div>
              </div>
              {/* Toggle Off */}
              <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

          </div>
        </section>

        <div className="pt-4 text-center">
            <p className="text-xs text-gray-400 mt-2">Rythmiq Web Player • Made with Next.js</p>
        </div>

      </div>
    </div>
  );
}
