import Page from '@/app/settings/profile/page';
import { AuthProvider } from '@/contexts/auth';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
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
