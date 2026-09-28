'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { getCurrentUser } from './authSlice';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void store.dispatch(getCurrentUser());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
