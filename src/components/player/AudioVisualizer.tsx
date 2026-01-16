"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode;
  isPlaying: boolean;
}

export function AudioVisualizer({ analyser, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI Display Support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Configuration
    analyser.fftSize = 256; // Controls bar count (256 gives ~128 visible bars)
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      if (!isPlaying) {
         // Optional: slowly decay bars here instead of freezing
         // For now, we pause the loop
         return;
      }

      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear Canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw Bars
      const barWidth = (rect.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * rect.height; // Normalize height

        // Gradient Color (Indigo to Purple)
        const gradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
        gradient.addColorStop(0, "rgb(99, 102, 241)"); // Indigo-500
        gradient.addColorStop(1, "rgb(168, 85, 247)"); // Purple-500

        ctx.fillStyle = gradient;

        // Draw rounded top bar
        ctx.beginPath();
        ctx.roundRect(x, rect.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 2; // +2 for gap
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [analyser, isPlaying]);

  return (
    <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
    />
  );
}
