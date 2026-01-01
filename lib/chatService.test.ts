import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPrivateChat } from './chatService';
import { getDocs, addDoc } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
  };
});


describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing chat if found', async () => {
    const mockDocs = [
      { id: 'chat123', data: () => ({ participants: ['user1', 'user2'], type: 'private' }) }
    ];

    vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);


    const chatId = await createPrivateChat('user1', 'user2');

    expect(chatId).toBe('chat123');
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('creates new chat if not found', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    vi.mocked(addDoc).mockResolvedValueOnce({ id: 'newChatId' } as any);


    const chatId = await createPrivateChat('user1', 'user3');

    expect(chatId).toBe('newChatId');
    expect(addDoc).toHaveBeenCalled();
  });
});
