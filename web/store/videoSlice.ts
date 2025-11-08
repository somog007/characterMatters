import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  duration: number;
  createdAt: string;
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch videos');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch video');
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch video by ID
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<Video>) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentVideo } = videoSlice.actions;
export default videoSlice.reducer;
