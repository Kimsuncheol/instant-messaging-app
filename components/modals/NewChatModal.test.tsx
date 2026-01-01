import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewChatModal } from './NewChatModal';
import { searchUsers } from '@/lib/userService';
import { createPrivateChat } from '@/lib/chatService';
import { AuthContext } from '@/context/AuthContext';

// Mock the services
vi.mock('@/lib/userService', () => ({
  searchUsers: vi.fn(),
}));

vi.mock('@/lib/chatService', () => ({
  createPrivateChat: vi.fn(),
}));

const mockUser = { uid: 'me', email: 'me@example.com', displayName: 'Me' };

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser as any, loading: false }}>

      {component}
    </AuthContext.Provider>
  );
};

describe('NewChatModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs a debounced search', async () => {
    vi.mocked(searchUsers).mockResolvedValue([
      { uid: '1', displayName: 'John', email: 'john@example.com', photoURL: '' }
    ]);

    renderWithContext(<NewChatModal open={true} onClose={() => {}} />);
    
    const input = screen.getByPlaceholderText(/search by email or name/i);
    fireEvent.change(input, { target: { value: 'john' } });

    // Wait for the debounce and service call
    await waitFor(() => {
      expect(searchUsers).toHaveBeenCalledWith('john');
    });

    expect(await screen.findByText('John')).toBeInTheDocument();
  });

  it('triggers chat creation and redirects', async () => {
    vi.mocked(searchUsers).mockResolvedValue([
      { uid: '1', displayName: 'John', email: 'john@example.com', photoURL: '' }
    ]);
    vi.mocked(createPrivateChat).mockResolvedValue('chat_123');

    const onClose = vi.fn();
    renderWithContext(<NewChatModal open={true} onClose={onClose} />);
    
    // Type search
    fireEvent.change(screen.getByPlaceholderText(/search by email or name/i), { target: { value: 'john' } });
    
    // Select user
    const userItem = await screen.findByText('John');
    fireEvent.click(userItem);

    await waitFor(() => {
      expect(createPrivateChat).toHaveBeenCalledWith('me', '1');
      expect(onClose).toHaveBeenCalled();
    });
  });
});
