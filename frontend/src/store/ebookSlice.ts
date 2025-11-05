import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ebookAPI } from '../services/api';

interface EBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  fileURL: string;
  price: number;
  pages: number;
  category: any;
  publisher: string;
  publishedDate: Date;
  createdBy: any;
}

interface EBookState {
  ebooks: EBook[];
  currentEBook: EBook | null;
  loading: boolean;
  error: string | null;
}

const initialState: EBookState = {
  ebooks: [],
  currentEBook: null,
  loading: false,
  error: null,
};

export const fetchEBooks = createAsyncThunk(
  'ebooks/fetchEBooks',
  async (filters?: any) => {
    const response = await ebookAPI.getAll(filters);
    return response.data;
  }
);

export const fetchEBook = createAsyncThunk(
  'ebooks/fetchEBook',
  async (id: string) => {
    const response = await ebookAPI.getById(id);
    return response.data;
  }
);

export const purchaseEBook = createAsyncThunk(
  'ebooks/purchaseEBook',
  async (id: string) => {
    const response = await ebookAPI.purchase(id);
    return response.data;
  }
);

const ebookSlice = createSlice({
  name: 'ebooks',
  initialState,
  reducers: {
    clearCurrentEBook: (state) => {
      state.currentEBook = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.ebooks = action.payload.ebooks;
      })
      .addCase(fetchEBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ebooks';
      })
      .addCase(fetchEBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEBook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEBook = action.payload;
      })
      .addCase(fetchEBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ebook';
      })
      .addCase(purchaseEBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(purchaseEBook.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(purchaseEBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to purchase ebook';
      });
  },
});

export const { clearCurrentEBook, clearError } = ebookSlice.actions;
export default ebookSlice.reducer;
