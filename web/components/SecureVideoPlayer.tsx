'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DynamicWatermark } from './DynamicWatermark';
import { API_BASE_URL, getCsrfToken } from '@/lib/api';

interface VideoPlayerProps {
  videoId: string;
  backendUrl?: string;
}

export const SecureVideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  backendUrl = API_BASE_URL,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Request Secure Playback Credentials & Manifest Token
  useEffect(() => {
    const initPlayback = async () => {
      try {
        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/playback/${videoId}/playback-session`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken() || '',
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

    if (videoId) {
      initPlayback();
    }
  }, [videoId, backendUrl]);

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
              xhr.withCredentials = true;
              if (url.includes('/hls-key')) {
                xhr.setRequestHeader('X-Playback-Session', playbackData.sessionToken);
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
  }, [playbackData]);

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
