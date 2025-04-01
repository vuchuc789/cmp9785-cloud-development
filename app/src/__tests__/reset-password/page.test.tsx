import { EmailForm } from '@/app/reset-password/email-form';
import { ResetPasswordForm } from '@/app/reset-password/reset-password-form';
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
  it('renders reset password page (without token) unchanged', () => {
    const { container } = render(
      <AuthProvider>
        <EmailForm />
      </AuthProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders reset password page (without token) unchanged', () => {
    const { container } = render(
      <AuthProvider>
        <ResetPasswordForm token="c7566ed5-0ec4-412a-b6ef-b012f02366e4" />
      </AuthProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
