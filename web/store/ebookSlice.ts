import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Ebook {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  fileUrl: string;
  category: string;
  author: string;
  price: number;
  createdAt: string;
}

interface EbookState {
  ebooks: Ebook[];
  currentEbook: Ebook | null;
  loading: boolean;
  error: string | null;
}

const initialState: EbookState = {
  ebooks: [],
  currentEbook: null,
  loading: false,
  error: null,
};

export const fetchEbooks = createAsyncThunk(
  'ebooks/fetchEbooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ebooks');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ebooks');
    }
  }
);

export const fetchEbookById = createAsyncThunk(
  'ebooks/fetchEbookById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ebooks/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ebook');
    }
  }
);

const ebookSlice = createSlice({
  name: 'ebooks',
  initialState,
  reducers: {
    clearCurrentEbook: (state) => {
      state.currentEbook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all ebooks
      .addCase(fetchEbooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEbooks.fulfilled, (state, action: PayloadAction<Ebook[]>) => {
        state.loading = false;
        state.ebooks = action.payload;
      })
      .addCase(fetchEbooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch ebook by ID
      .addCase(fetchEbookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEbookById.fulfilled, (state, action: PayloadAction<Ebook>) => {
        state.loading = false;
        state.currentEbook = action.payload;
      })
      .addCase(fetchEbookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentEbook } = ebookSlice.actions;
export default ebookSlice.reducer;
