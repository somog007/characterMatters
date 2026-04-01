import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminManagement from './AdminManagement';
import authReducer from '../store/authSlice';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

describe('AdminManagement', () => {
  it('shows admin required message for non-admin users', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: '1', name: 'User', email: 'user@test.com', role: 'free-user' },
          token: 'token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <AdminManagement />
      </Provider>
    );

    expect(screen.getByText(/Admin access required/i)).toBeInTheDocument();
  });
});
