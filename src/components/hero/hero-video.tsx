"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "@/components/icons";
import { getAssetPath } from "@/lib/assets";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleMouseEnter = () => {
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setShowControls(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (isPlaying) {
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1200);
    }
  };

  const togglePlay = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setShowControls(true);
    } else {
      video.pause();
      setShowControls(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1200);
    } else {
      setShowControls(true);
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="bg-card ring-foreground/10 border-card pointer-events-auto mx-auto overflow-hidden rounded-xl border p-1 shadow-lg shadow-black/5 ring-1 lg:max-w-5xl">
      <div
        role="region"
        tabIndex={0}
        aria-label="StageTimer product video demo"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => togglePlay()}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            togglePlay(e);
          }
        }}
        className="group relative aspect-video w-full cursor-pointer select-none overflow-hidden rounded-lg bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <video
          ref={videoRef}
          src={getAssetPath("/videos/stagetimer-hero.mp4")}
          poster={getAssetPath("/videos/stagetimer-hero-poster.jpg")}
          muted
          playsInline
          loop
          preload="metadata"
          className="size-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Mid Play / Pause Button Only */}
        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ${
            isPlaying && !showControls ? "opacity-0" : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="pointer-events-auto flex size-16 sm:size-20 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/65 active:scale-95"
          >
            {isPlaying ? (
              <PauseIcon className="size-7 sm:size-8 fill-white text-white drop-shadow-md" />
            ) : (
              <PlayIcon className="ml-1 size-7 sm:size-8 fill-white text-white drop-shadow-md" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
