import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
type BillingCycle = 'MONTHLY' | 'YEARLY' | 'ACADEMIC_SESSION';

interface Subscription {
  id?: string;
  plan?: string;
  status: SubscriptionStatus;
  billingCycle?: BillingCycle;
  priceAmountNgn?: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  paymentProvider?: string;
}

interface SubscriptionState {
  data: Subscription | null;
  loading: boolean;
  verifying: boolean;
  error: string | null;
  checkoutUrl: string | null;
  reference: string | null;
  successMessage: string | null;
}

const initialState: SubscriptionState = {
  data: null,
  loading: false,
  verifying: false,
  error: null,
  checkoutUrl: null,
  reference: null,
  successMessage: null,
};

const handleError = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } } };
  return err.response?.data?.message || fallback;
};

export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/subscriptions');
      return res.data as Subscription;
    } catch (error: unknown) {
      return rejectWithValue(handleError(error, 'Failed to fetch subscription'));
    }
  }
);

export const startPaystackCheckout = createAsyncThunk(
  'subscription/startPaystackCheckout',
  async (
    payload: { planId: string; amount: number; billingCycle?: BillingCycle },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post('/subscriptions/checkout/paystack', payload);
      return res.data as { authorizationUrl: string; reference: string };
    } catch (error: unknown) {
      return rejectWithValue(handleError(error, 'Failed to start Paystack checkout'));
    }
  }
);

export const verifyPaystackCheckout = createAsyncThunk(
  'subscription/verifyPaystackCheckout',
  async (payload: { reference: string }, { rejectWithValue }) => {
    try {
      const res = await api.get('/subscriptions/checkout/paystack/verify', {
        params: payload,
      });
      return res.data as { message: string; subscription: Subscription };
    } catch (error: unknown) {
      return rejectWithValue(handleError(error, 'Failed to verify Paystack checkout'));
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
      return rejectWithValue(handleError(error, 'Failed to cancel subscription'));
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearCheckoutState(state) {
      state.checkoutUrl = null;
      state.reference = null;
      state.successMessage = null;
    },
  },
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
      .addCase(startPaystackCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(startPaystackCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload.authorizationUrl;
        state.reference = action.payload.reference;
      })
      .addCase(startPaystackCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyPaystackCheckout.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyPaystackCheckout.fulfilled, (state, action) => {
        state.verifying = false;
        state.data = action.payload.subscription;
        state.checkoutUrl = null;
        state.reference = null;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyPaystackCheckout.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        if (state.data) state.data.status = 'CANCELED';
        state.reference = null;
        state.checkoutUrl = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCheckoutState } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
