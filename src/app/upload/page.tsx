"use client";

import { useState } from "react";
import { Upload, Music, Image as ImageIcon, CheckCircle, Disc, Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [status, setStatus] = useState<"idle" | "validating" | "ready">("idle");

  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    coverUrl: "",
    fileUrl: "",
    mood: "Chill",
  });

  const moods = ["Happy", "Sad", "Chill", "Party", "Focus", "Workout", "Romantic"];

  // Handle URL Paste & Calculate Duration
  const handleFileUrlChange = (url: string) => {
    setFormData({ ...formData, fileUrl: url });

    if (!url) {
        setStatus("idle");
        return;
    }

    setStatus("validating");

    const audio = new Audio(url);

    audio.onloadedmetadata = () => {
      if (audio.duration === Infinity || isNaN(audio.duration)) {
          setStatus("idle");
          toast.error("Could not determine duration. Is this a stream?");
      } else {
          setDuration(audio.duration);
          setStatus("ready");
          toast.success("Audio metadata loaded!", { id: "audio-meta" });
      }
    };

    audio.onerror = () => {
      setStatus("idle");
      if (url.length > 10) {
        toast.error("Invalid audio URL or format.");
      }
    };
  };

  const simulateProgress = () => {
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "ready") {
        toast.error("Please provide a valid audio URL first.");
        return;
    }

    setLoading(true);
    const progressInterval = simulateProgress();

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration: duration,
        }),
      });

      if (res.ok) {
        clearInterval(progressInterval);
        setProgress(100);
        toast.success("Track uploaded successfully!");

        setTimeout(() => {
            setFormData({
                name: "",
                artist: "",
                coverUrl: "",
                fileUrl: "",
                mood: "Chill", // Reset mood as well
            });
            setStatus("idle");
            setDuration(0);
            setProgress(0);
            setLoading(false);
            router.refresh();
        }, 1000);

      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error("Something went wrong. Please try again.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    // CHANGED: Removed h-full, added min-h-full and massive bottom padding (pb-40) to clear the player
    <div className="min-h-full w-full flex flex-col items-center justify-center p-4 pb-32 md:pb-48">

      <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-500">

        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Track</h1>
              <p className="text-gray-500 text-sm mt-1">Add new music to your library.</p>
          </div>
          <div className="hidden md:flex p-3 bg-indigo-50 rounded-full text-indigo-600 shadow-sm border border-indigo-100">
              <Disc size={24} className={loading ? "animate-spin-slow" : ""} />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">

          {/* Top Progress Bar Loader */}
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
              <div
                  className="h-full bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className={`p-6 md:p-8 space-y-6 ${loading ? "opacity-75 pointer-events-none" : ""}`}>

            {/* Row 1: Title & Artist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Track Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Midnight City"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Artist</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. M83"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                />
              </div>
            </div>

            {/* Row 2: Mood Selection Buttons */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Vibe / Mood</label>
                <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                        <button
                            key={m}
                            type="button" // Prevent form submission
                            onClick={() => setFormData({ ...formData, mood: m })}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                ${formData.mood === m
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                }
                            `}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Row 3: Cover URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Cover Image URL</label>
              <div className="relative group">
                <ImageIcon className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Row 4: Audio URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Audio File URL</label>
                {status === 'ready' && (
                  <span className="text-green-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-100">
                    <CheckCircle size={10}/> Ready ({Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')})
                  </span>
                )}
              </div>

              <div className="relative group">
                <Music className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  required
                  type="url"
                  placeholder="https://storage.com/song.mp3"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border focus:bg-white focus:ring-4 transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400
                    ${status === 'ready'
                        ? 'border-green-200 focus:border-green-500 focus:ring-green-500/10'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                    }
                  `}
                  value={formData.fileUrl}
                  onChange={(e) => handleFileUrlChange(e.target.value)}
                />

                {status === "validating" && (
                    <div className="absolute right-3 top-2.5">
                        <Loader2 size={18} className="animate-spin text-indigo-600"/>
                    </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || status !== "ready"}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform duration-200 flex items-center justify-center gap-2 shadow-sm
                  ${loading || status !== "ready"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg active:scale-[0.99]"
                  }
                `}
              >
                {loading ? (
                  <span className="text-sm font-medium">Processing... {progress}%</span>
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="text-sm font-medium">Upload Track</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
