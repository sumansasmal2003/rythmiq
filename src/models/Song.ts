import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISong extends Document {
  name: string;
  artist: string[]; // Array of strings for multiple artists
  coverUrl: string;
  fileUrl: string;
  duration: number; // Stored in seconds (e.g., 245 for 4:05)
  createdAt: Date;
  blurDataUrl?: string;
  mood: string;
}

const SongSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a song name"],
      trim: true
    },
    artist: {
      type: [String], // Storing as array ['Artist1', 'Artist2']
      required: [true, "Please provide the artist name(s)"]
    },
    coverUrl: {
      type: String,
      required: [true, "Please provide a cover image URL"]
    },
    fileUrl: {
      type: String,
      required: [true, "Please provide the music file URL"]
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 0
    },
    blurDataUrl: { type: String, default: "" },
    mood: {
      type: String,
      required: true,
      enum: ["Happy", "Sad", "Chill", "Party", "Focus", "Workout", "Romantic"],
      default: "Chill"
    },
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reloads in Next.js
const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;
