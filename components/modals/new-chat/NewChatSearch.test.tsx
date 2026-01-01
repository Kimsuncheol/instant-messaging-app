import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewChatSearch } from './NewChatSearch';

describe('NewChatSearch', () => {
  it('renders with correct value', () => {
    render(<NewChatSearch value="test query" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search by email or name/i)).toHaveValue('test query');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<NewChatSearch value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/search by email or name/i);
    fireEvent.change(input, { target: { value: 'new search' } });
    expect(onChange).toHaveBeenCalledWith('new search');
  });
});
