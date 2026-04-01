import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GalleryWithSearch from './GalleryWithSearch';
import authReducer from '../store/authSlice';

jest.mock('react-infinite-scroll-component', () => ({
  __esModule: true,
  default: ({ children }: { children: any }) => <div>{children}</div>,
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  galleryAPI: {
    getAll: jest.fn().mockResolvedValue({ data: { items: [], totalPages: 0 } }),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('GalleryWithSearch', () => {
  it('renders gallery page title', async () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
          token: 'token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <GalleryWithSearch />
      </Provider>
    );

    expect(screen.getByText(/Events Gallery/i)).toBeInTheDocument();
  });
});
