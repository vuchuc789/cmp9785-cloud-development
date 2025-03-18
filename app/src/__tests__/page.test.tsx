import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => '8eb27645-39d9-4f26-a10a-4bfdcd9cc233',
  },
});

describe('Page', () => {
  it('renders a path', () => {
    render(<Page />);

    const path = screen.getByText('Search now');

    expect(path).toBeInTheDocument();
  });

  it('renders homepage unchanged', () => {
    const { container } = render(<Page />);
    expect(container).toMatchSnapshot();
  });
});
