import VerifyPasswordPage from '@/app/verify-email/page';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: () => {} }),
}));

jest.mock('../../contexts/auth', () => ({
  useAuth: jest.fn(() => ({ state: { accessToken: null, isLoading: false } })),
}));

jest.mock('../../client/', () => ({
  verifyEmailUsersVerifyEmailGet: jest.fn(() => ({
    response: { status: 200 },
  })),
}));

describe('VerifyPasswordPage', () => {
  it('renders EmailForm unchanged', async () => {
    let container;
    await act(async () => {
      const Result = VerifyPasswordPage({
        searchParams: new Promise((resolve) => resolve({})),
      });
      const result = render(Result);

      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });
});
