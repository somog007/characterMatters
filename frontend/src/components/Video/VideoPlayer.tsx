import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, thumbnail }) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        controls
        className="w-full h-auto max-h-[70vh]"
        poster={thumbnail || "/video-poster.jpg"}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {title && (
        <div className="p-4">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;