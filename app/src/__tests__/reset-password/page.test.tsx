import ResetPasswordPage from '@/app/reset-password/page';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: () => {} }),
}));

jest.mock('../../contexts/auth', () => ({
  useAuth: jest.fn(() => ({ state: { accessToken: null, isLoading: false } })),
}));

describe('ResetPasswordPage', () => {
  it('renders EmailForm unchanged', async () => {
    let container;
    await act(async () => {
      const Result = ResetPasswordPage({
        searchParams: new Promise((resolve) => resolve({})),
      });
      const result = render(Result);

      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });

  it('renders ResetPasswordForm unchanged', async () => {
    let container;
    await act(async () => {
      const Result = ResetPasswordPage({
        searchParams: new Promise((resolve) => resolve({ token: 'abc' })),
      });
      const result = render(Result);

      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });
});
