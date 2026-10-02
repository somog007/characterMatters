import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  loading: boolean;
  error: string | null;
  emailVerificationRequired: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  mustChangePassword: false,
  loading: true,
  error: null,
  emailVerificationRequired: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return { ...response.data, user: { ...response.data.user, name: response.data.user.fullName } };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; code?: string } } };
      return rejectWithValue({
        message: err.response?.data?.message || 'Login failed',
        code: err.response?.data?.code,
      });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    credentials: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put('/auth/password', credentials);
      return { ...response.data, user: { ...response.data.user, name: response.data.user.fullName } };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Password change failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data as {
        emailVerificationRequired: boolean;
        verificationEmailQueued?: boolean;
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return { user: { ...response.data, name: response.data.fullName } };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; code?: string } } };
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to get user',
        code: err.response?.data?.code,
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.mustChangePassword = false;
      state.error = null;
      state.emailVerificationRequired = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.emailVerificationRequired = false;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; mustChangePassword?: boolean }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.mustChangePassword = Boolean(action.payload.mustChangePassword);
        state.user = action.payload.user;
        state.emailVerificationRequired = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; code?: string } | undefined;
        state.error = payload?.message || action.error.message || 'Login failed';
        state.emailVerificationRequired = payload?.code === 'EMAIL_VERIFICATION_REQUIRED';
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.mustChangePassword = false;
        state.user = action.payload.user;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.emailVerificationRequired = false;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.mustChangePassword = false;
        state.emailVerificationRequired = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        const payload = action.payload as { code?: string } | undefined;
        state.mustChangePassword = payload?.code === 'PASSWORD_CHANGE_REQUIRED';
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
