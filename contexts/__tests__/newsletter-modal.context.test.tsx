import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsletterModalContextProvider, useNewsletterModalContext } from '../newsletter-modal.context';

// Test component that uses the context
function TestComponent() {
  const { isModalOpened, setIsModalOpened } = useNewsletterModalContext();

  return (
    <div>
      <div data-testid="modal-status">{isModalOpened ? 'opened' : 'closed'}</div>
      <button onClick={() => setIsModalOpened(true)} data-testid="open-button">
        Open Modal
      </button>
      <button onClick={() => setIsModalOpened(false)} data-testid="close-button">
        Close Modal
      </button>
    </div>
  );
}

describe('NewsletterModalContext', () => {
  it('should provide default modal state as closed', () => {
    render(
      <NewsletterModalContextProvider>
        <TestComponent />
      </NewsletterModalContextProvider>
    );

    expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
  });

  it('should allow opening the modal', async () => {
    const user = userEvent.setup();

    render(
      <NewsletterModalContextProvider>
        <TestComponent />
      </NewsletterModalContextProvider>
    );

    const openButton = screen.getByTestId('open-button');
    await user.click(openButton);

    expect(screen.getByTestId('modal-status')).toHaveTextContent('opened');
  });

  it('should allow closing the modal', async () => {
    const user = userEvent.setup();

    render(
      <NewsletterModalContextProvider>
        <TestComponent />
      </NewsletterModalContextProvider>
    );

    // First open the modal
    const openButton = screen.getByTestId('open-button');
    await user.click(openButton);
    expect(screen.getByTestId('modal-status')).toHaveTextContent('opened');

    // Then close it
    const closeButton = screen.getByTestId('close-button');
    await user.click(closeButton);
    expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNewsletterModalContext can only be used inside NewsletterModalContextProvider');

    consoleSpy.mockRestore();
  });

  it('should provide context value to multiple children', () => {
    function ChildComponent({ id }: { id: string }) {
      const { isModalOpened } = useNewsletterModalContext();
      return <div data-testid={`child-${id}`}>{isModalOpened ? 'opened' : 'closed'}</div>;
    }

    render(
      <NewsletterModalContextProvider>
        <ChildComponent id="1" />
        <ChildComponent id="2" />
        <ChildComponent id="3" />
      </NewsletterModalContextProvider>
    );

    expect(screen.getByTestId('child-1')).toHaveTextContent('closed');
    expect(screen.getByTestId('child-2')).toHaveTextContent('closed');
    expect(screen.getByTestId('child-3')).toHaveTextContent('closed');
  });

  it('should update all children when modal state changes', async () => {
    const user = userEvent.setup();

    function ChildComponent({ id }: { id: string }) {
      const { isModalOpened, setIsModalOpened } = useNewsletterModalContext();
      return (
        <div>
          <div data-testid={`child-${id}`}>{isModalOpened ? 'opened' : 'closed'}</div>
          <button onClick={() => setIsModalOpened(true)} data-testid={`open-child-${id}`}>
            Open from Child {id}
          </button>
        </div>
      );
    }

    render(
      <NewsletterModalContextProvider>
        <ChildComponent id="1" />
        <ChildComponent id="2" />
      </NewsletterModalContextProvider>
    );

    // Open modal from child 1
    await user.click(screen.getByTestId('open-child-1'));

    // Both children should reflect the opened state
    expect(screen.getByTestId('child-1')).toHaveTextContent('opened');
    expect(screen.getByTestId('child-2')).toHaveTextContent('opened');
  });
});