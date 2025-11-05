import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { videoAPI } from '../services/api';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoURL: string;
  duration: number;
  category: any;
  accessLevel: string;
  views: number;
  likes: number;
  createdBy: any;
}

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
};

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (filters?: any) => {
    const response = await videoAPI.getAll(filters);
    return response.data;
  }
);

export const fetchVideo = createAsyncThunk(
  'videos/fetchVideo',
  async (id: string) => {
    const response = await videoAPI.getById(id);
    return response.data;
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.videos;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch videos';
      })
      .addCase(fetchVideo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch video';
      });
  },
});

export const { clearCurrentVideo, clearError } = videoSlice.actions;
export default videoSlice.reducer;