import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchVideo, clearCurrentVideo } from '../store/videoSlice';
import VideoPlayer from '../components/Video/VideoPlayer';

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentVideo, loading, error } = useSelector((state: RootState) => state.videos);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchVideo(id));
    }
    return () => {
      dispatch(clearCurrentVideo());
    };
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/videos')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          ← Back to Videos
        </button>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Video not found</p>
        <button
          onClick={() => navigate('/videos')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          ← Back to Videos
        </button>
      </div>
    );
  }

  const canAccess = currentVideo.accessLevel === 'free' || user?.subscription?.status === 'active';

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/videos')}
        className="mb-4 text-indigo-600 hover:text-indigo-500 flex items-center"
      >
        ← Back to Videos
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Video Player */}
        {canAccess ? (
          <VideoPlayer videoUrl={currentVideo.videoURL} thumbnail={currentVideo.thumbnail} />
        ) : (
          <div className="bg-gray-900 aspect-video flex items-center justify-center">
            <div className="text-center text-white p-8">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
              <p className="mb-4">Subscribe to access this video</p>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                View Plans
              </button>
            </div>
          </div>
        )}

        {/* Video Info */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentVideo.title}
          </h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <span>{currentVideo.views} views</span>
              <span className="mx-2">•</span>
              <span>{currentVideo.likes} likes</span>
              <span className="mx-2">•</span>
              <span>{Math.floor(currentVideo.duration / 60)} minutes</span>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              currentVideo.accessLevel === 'premium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {currentVideo.accessLevel}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {currentVideo.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
