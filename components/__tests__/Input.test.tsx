import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('should render correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should accept placeholder prop', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should accept value prop with onChange', () => {
    const mockOnChange = jest.fn();
    render(<Input value="test value" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('should accept type prop', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle onChange event', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(<Input onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should accept name prop', () => {
    render(<Input name="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'test-input');
  });

  it('should accept id prop', () => {
    render(<Input id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('should accept disabled prop', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should accept required prop', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('should have correct default styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle({
      borderRadius: '0.6rem',
      fontSize: '1.6rem',
      padding: '1.8rem',
    });
  });
});