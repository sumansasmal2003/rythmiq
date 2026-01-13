import { create } from 'zustand';

export interface Song {
  _id: string;
  name: string;
  artist: string[];
  coverUrl: string;
  fileUrl: string;
  duration: number;
  mood?: string;
}

interface PlayerStore {
  activeSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  isQueueOpen: boolean;

  setActiveSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleQueue: () => void;
  removeFromQueue: (songId: string) => void;
  reorderQueue: (newQueue: Song[]) => void;

  playSmart: (song: Song) => void; // <--- NEW ACTION
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  activeSong: null,
  isPlaying: false,
  queue: [],
  isQueueOpen: false,

  setActiveSong: (song) => set({ activeSong: song, isPlaying: true }),

  setQueue: (songs) => set({ queue: songs }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),

  removeFromQueue: (songId) => set((state) => ({
    queue: state.queue.filter((s) => s._id !== songId)
  })),

  reorderQueue: (newQueue) => set({ queue: newQueue }),

  // --- NEW SMART PLAY LOGIC ---
  // When user clicks a song from Home/Library, we REORDER the list
  // to put same-mood songs next.
  playSmart: (clickedSong) => {
    const { queue } = get();

    // Safety: If queue is empty, just play the song
    if (queue.length === 0) {
        set({ activeSong: clickedSong, isPlaying: true });
        return;
    }

    // 1. Separate the clicked song and the rest
    const others = queue.filter(s => s._id !== clickedSong._id);

    // 2. Filter remaining songs by mood
    const sameMood = others.filter(s => s.mood === clickedSong.mood);
    const diffMood = others.filter(s => s.mood !== clickedSong.mood);

    // 3. Construct new order: [Clicked, ...SameMood, ...DifferentMood]
    const smartQueue = [clickedSong, ...sameMood, ...diffMood];

    set({
        queue: smartQueue,
        activeSong: clickedSong,
        isPlaying: true
    });
  },

  // --- STANDARD SEQUENTIAL PLAYBACK ---
  // Now simpler, because the queue is ALREADY sorted by playSmart.
  playNext: () => {
    const { activeSong, queue } = get();
    if (!activeSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s._id === activeSong._id);

    // Just play the next one in the list (wrapping to start if at end)
    const nextIndex = (currentIndex + 1) % queue.length;

    set({ activeSong: queue[nextIndex], isPlaying: true });
  },

  playPrevious: () => {
    const { activeSong, queue } = get();
    if (!activeSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s._id === activeSong._id);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
        prevIndex = queue.length - 1;
    }

    set({ activeSong: queue[prevIndex], isPlaying: true });
  },
}));
