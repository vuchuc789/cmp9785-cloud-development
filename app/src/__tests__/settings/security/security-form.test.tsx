import Page from '@/app/settings/profile/page';
import { AuthProvider } from '@/contexts/auth';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('../../../client/', () => ({
  refreshAccessTokenUsersRefreshPost: jest.fn(() => ({
    data: { accessToken: 'abc' },
  })),
  getCurrentUserInfoUsersInfoGet: jest.fn(() => ({
    data: {},
    response: { status: 200 },
  })),
}));

describe('Page', () => {
  it('renders security page unchanged', () => {
    const { container } = render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
