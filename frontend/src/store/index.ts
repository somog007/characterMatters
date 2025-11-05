import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videoReducer from './videoSlice';
import ebookReducer from './ebookSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videoReducer,
    ebooks: ebookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch