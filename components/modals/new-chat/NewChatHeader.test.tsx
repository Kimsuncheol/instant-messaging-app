import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewChatHeader } from './NewChatHeader';

describe('NewChatHeader', () => {
  it('renders the title correctly', () => {
    render(<NewChatHeader onClose={() => {}} />);
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NewChatHeader onClose={onClose} />);
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
