"use client";
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Loader } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onComplete?: () => void;
  autoPlay?: boolean;
  startTime?: number;
}

export function VideoPlayer({
  videoId,
  title,
  onComplete = () => {},
  autoPlay = false,
  startTime = 0,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize the player when API is loaded
    const onYouTubeIframeAPIReady = () => {
      if (typeof YT === "undefined" || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          start: startTime,
          autoplay: autoPlay ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsLoading(false);
          },
          onStateChange: (event) => {
            // Update playing state
            setIsPlaying(event.data === YT.PlayerState.PLAYING);

            // Call onComplete when video ends
            if (event.data === YT.PlayerState.ENDED && onComplete) {
              onComplete();
            }
          },
          onError: () => {
            setError("Unable to load the video. Please try again later.");
            setIsLoading(false);
          },
        },
      });
    };

    // Attach the callback to window to make it globally accessible
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // If API is already loaded, initialize the player
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    }

    return () => {
      // Clean up the player
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoPlay, startTime, onComplete]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h2
          className="text-xl font-semibold text-foreground font-serif mb-2"
          id={`video-title-${videoId}`}
          aria-label={`Meditation video: ${title}`}
        >
          {title}
        </h2>
      </div>

      <div className="relative aspect-video w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader className="animate-spin text-primary h-12 w-12" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-destructive p-4 text-center">
            <p>{error}</p>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          aria-labelledby={`video-title-${videoId}`}
        ></div>
      </div>

      <div className="p-4 bg-muted flex items-center space-x-4">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-600 transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          disabled={isLoading || !!error}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary-300 transition-colors"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          disabled={isLoading || !!error}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}
