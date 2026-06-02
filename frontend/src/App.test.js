import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    const body = url.includes('/products/')
      ? []
      : url.includes('/customers/')
        ? []
        : [];

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the OMS dashboard', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  expect(screen.getByText(/total products/i)).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});
