import Page from '@/app/login/page';
import { AuthProvider } from '@/contexts/auth';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({}),
}));

jest.mock('../../client/', () => ({
  refreshAccessTokenUsersRefreshPost: jest.fn(() => ({
    data: { accessToken: 'abc' },
  })),
  getCurrentUserInfoUsersInfoGet: jest.fn(() => ({
    data: {},
    response: { status: 200 },
  })),
}));

describe('Page', () => {
  it('renders login page unchanged', () => {
    const { container } = render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
