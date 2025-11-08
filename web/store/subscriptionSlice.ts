import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Subscription {
  _id?: string;
  plan?: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

interface SubscriptionState {
  data: Subscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/subscriptions');
      return res.data as Subscription;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (payload: { planId: string; priceId: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/subscriptions', payload);
      return res.data as { message: string; subscription: Subscription };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete('/subscriptions');
      return res.data as { message: string };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      })
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action: PayloadAction<{ message: string; subscription: Subscription }>) => {
        state.loading = false;
        state.data = action.payload.subscription;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        if (state.data) state.data.status = 'canceled';
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default subscriptionSlice.reducer;
