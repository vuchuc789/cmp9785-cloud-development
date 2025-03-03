import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

describe('Page', () => {
  it('renders a path', () => {
    render(<Page />)

    const path = screen.getByText("src/app/page.tsx")

    expect(path).toBeInTheDocument()
  })

  it('renders homepage unchanged', () => {
    const { container } = render(<Page />)
    expect(container).toMatchSnapshot()
  })
})

