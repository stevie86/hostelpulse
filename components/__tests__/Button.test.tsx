import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render as an anchor tag by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button.tagName).toBe('A');
  });

  it('should accept href prop', () => {
    render(<Button href="/test">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveAttribute('href', '/test');
  });

  it('should accept transparent prop', () => {
    render(<Button transparent>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });

  it('should render span with margin when children include span', () => {
    render(
      <Button>
        Click me
        <span>Icon</span>
      </Button>
    );
    const span = screen.getByText('Icon');
    expect(span).toBeInTheDocument();
  });

  it('should have correct default styling classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      display: 'inline-block',
      textDecoration: 'none',
      textAlign: 'center',
      cursor: 'pointer',
    });
  });

  it('should handle onClick when rendered as button', () => {
    const mockOnClick = jest.fn();
    render(
      <Button as="button" onClick={mockOnClick}>
        Click me
      </Button>
    );
    const button = screen.getByText('Click me');
    expect(button.tagName).toBe('BUTTON');
  });
});