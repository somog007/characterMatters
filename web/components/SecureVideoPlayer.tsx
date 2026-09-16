'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DynamicWatermark } from './DynamicWatermark';

interface VideoPlayerProps {
  videoId: string;
  authToken: string;
  backendUrl?: string;
}

export const SecureVideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, authToken, backendUrl = 'http://localhost:5000' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Request Secure Playback Credentials & Manifest Token
  useEffect(() => {
    const initPlayback = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/videos/${videoId}/playback-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
            'X-Device-ID': getOrCreateDeviceId()
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Playback authorization failed');
        }

        const data = await response.json();
        setPlaybackData(data);
      } catch (err: any) {
        setError(err.message || 'Error initializing playback session');
      }
    };

    if (videoId && authToken) {
      initPlayback();
    }
  }, [videoId, authToken, backendUrl]);

  // 2. Initialize Video Player with HLS / HTML5 Video Stream
  useEffect(() => {
    if (!playbackData || !videoRef.current) return;

    const video = videoRef.current;
    let hlsInstance: any = null;

    const loadHlsPlayer = async () => {
      try {
        // Dynamically import hls.js for SSR / Client safety
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default;

        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            xhrSetup: (xhr: XMLHttpRequest, url: string) => {
              if (url.includes('/hls-key') || url.includes('/playback')) {
                xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
              }
            }
          });

          hlsInstance.loadSource(playbackData.manifestUrl);
          hlsInstance.attachMedia(video);

          hlsInstance.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              setError('Encrypted stream decoding failed or playback session expired.');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native Apple Safari HLS support
          video.src = playbackData.manifestUrl;
        } else {
          // Fallback to direct video URL if standard MP4/HLS
          video.src = playbackData.manifestUrl;
        }
      } catch (err) {
        // Fallback for native HTML5 video
        video.src = playbackData.manifestUrl;
      }
    };

    loadHlsPlayer();

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [playbackData, authToken]);

  // Helper device ID generator
  const getOrCreateDeviceId = () => {
    if (typeof window === 'undefined') return 'server-device';
    let id = localStorage.getItem('app_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_device_id', id);
    }
    return id;
  };

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-900 p-6 text-red-400">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()} // Disable Right Click Save
        className="h-full w-full object-contain"
      />

      {/* Dynamic Anti-Tamper Watermark Overlay */}
      {playbackData?.watermark && (
        <DynamicWatermark
          domain={playbackData.watermark.domain}
          userIdentifier={playbackData.watermark.userIdentifier}
          sessionHash={playbackData.watermark.sessionHash}
          opacity={playbackData.watermark.opacity}
          intervalSeconds={playbackData.watermark.intervalSeconds}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};
