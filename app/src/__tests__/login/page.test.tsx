import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: () => {} }),
}));

jest.mock('../../contexts/auth', () => ({
  useAuth: jest.fn(() => ({ state: { accessToken: null, isLoading: false } })),
}));

describe('LoginPage', () => {
  it('renders unchanged', async () => {
    let container;
    await act(async () => {
      const result = render(<LoginPage />);

      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });
});
