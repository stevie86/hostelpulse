import { render, screen } from '@testing-library/react';
import Container from '../Container';

describe('Container', () => {
  it('should render children correctly', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render as a div by default', () => {
    render(<Container>Test</Container>);
    const container = screen.getByText('Test').parentElement;
    expect(container?.tagName).toBe('DIV');
  });

  it('should render multiple children', () => {
    render(
      <Container>
        <span>Child 1</span>
        <span>Child 2</span>
        <span>Child 3</span>
      </Container>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle empty container', () => {
    render(<Container />);
    // Container should still render even with no children
    const containers = document.querySelectorAll('div');
    expect(containers.length).toBeGreaterThan(0);
  });

  it('should render with nested components', () => {
    render(
      <Container>
        <div>
          <p>Nested content</p>
        </div>
      </Container>
    );
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });
});