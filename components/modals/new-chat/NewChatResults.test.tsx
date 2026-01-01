import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewChatResults } from './NewChatResults';

const mockUsers = [
  { uid: '1', displayName: 'John Doe', email: 'john@example.com', photoURL: '' },
  { uid: '2', displayName: 'Jane Smith', email: 'jane@example.com', photoURL: '' },
];

const mockSubscribe = vi.fn();

vi.mock('@/lib/presenceService', () => ({
  subscribeToMultiplePresences: (userIds: string[], cb: (data: any) => void) => {
    mockSubscribe(userIds, cb);
    return vi.fn();
  },
}));


describe('NewChatResults', () => {
  it('renders loading state', () => {
    render(<NewChatResults loading={true} users={[]} searchTerm="" onSelectUser={() => {}} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state when searchTerm is too short', () => {
    render(<NewChatResults loading={false} users={[]} searchTerm="ab" onSelectUser={() => {}} />);
    expect(screen.getByText(/type at least 3 characters/i)).toBeInTheDocument();
  });

  it('renders "no users found" state', () => {
    render(<NewChatResults loading={false} users={[]} searchTerm="unknown" onSelectUser={() => {}} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders list of users', () => {
    render(<NewChatResults loading={false} users={mockUsers} searchTerm="john" onSelectUser={() => {}} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onSelectUser when a user is clicked', () => {
    const onSelectUser = vi.fn();
    render(<NewChatResults loading={false} users={mockUsers} searchTerm="john" onSelectUser={onSelectUser} />);
    fireEvent.click(screen.getByText('John Doe'));
    expect(onSelectUser).toHaveBeenCalledWith('1');
  });
});
