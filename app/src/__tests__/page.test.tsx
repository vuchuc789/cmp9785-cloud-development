import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Page from '../app/page';

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => '8eb27645-39d9-4f26-a10a-4bfdcd9cc233',
  },
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({}),
}));

jest.mock('../contexts/auth', () => ({
  useAuth: jest.fn(() => ({ state: { accessToken: 'abc', isLoading: false } })),
}));

describe('Homepage', () => {
  it('renders unchanged', () => {
    const { container } = render(<Page />);
    expect(container).toMatchSnapshot();
  });
});
