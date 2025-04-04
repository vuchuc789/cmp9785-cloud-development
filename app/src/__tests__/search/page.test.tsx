import SearchPage from '@/app/search/page';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => ({}),
}));

jest.mock('../../contexts/auth', () => ({
  useAuth: jest.fn(() => ({ state: { accessToken: 'abc', isLoading: false } })),
}));

jest.mock('../../client/', () => ({
  searchMediaMediaSearchGet: jest.fn(() => ({ error: { detail: [{}] } })),
  MediaType: { IMAGE: 'image' },
  MediaLicense: [],
}));

describe('SearchPage', () => {
  it('renders profile page unchanged', async () => {
    let container;
    await act(async () => {
      const result = render(<SearchPage />);

      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });
});
