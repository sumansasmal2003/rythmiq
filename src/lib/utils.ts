import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard Tailwind merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format seconds into MM:SS (e.g. 125 -> "2:05")
export function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to get duration from a URL (Promise wrapper)
export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      resolve(0); // Return 0 if link is invalid or CORS blocks it
    };
  });
}
