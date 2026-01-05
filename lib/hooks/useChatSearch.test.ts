import { renderHook, act } from '@testing-library/react';
import { useChatSearch } from './useChatSearch';
import { Message } from '../chatService';

// Mock Message
const createMessage = (id: string, text: string): Message => ({
  id,
  text,
  senderId: 'user1',
  chatId: 'chat1',
  createdAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: 0, nanoseconds: 0 } as any,
});

describe('useChatSearch', () => {
  const messages = [
    createMessage('1', 'Hello world'),
    createMessage('2', 'How are you?'),
    createMessage('3', 'Another world message'),
    createMessage('4', 'Testing search'),
  ];

  it('should initialize with empty search', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    expect(result.current.searchTerm).toBe('');
    expect(result.current.matches).toEqual([]);
    expect(result.current.currentMatchIndex).toBe(-1);
  });

  it('should find matches', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    
    act(() => {
      result.current.handleSearch('world');
    });

    expect(result.current.matches).toEqual(['1', '3']);
    // Should default to the last match (newest)
    expect(result.current.currentMatchIndex).toBe(1); 
    expect(result.current.currentMatchId).toBe('3');
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    
    act(() => {
      result.current.handleSearch('WORLD');
    });

    expect(result.current.matches).toEqual(['1', '3']);
  });

  it('should navigate between matches', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    
    act(() => {
      result.current.handleSearch('world');
    });

    // Currently at index 1 (id: '3')
    expect(result.current.currentMatchIndex).toBe(1);

    // Prev -> should go to index 0 (id: '1')
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentMatchIndex).toBe(0);
    expect(result.current.currentMatchId).toBe('1');

    // Prev again -> loop around to index 1 (id: '3')
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentMatchIndex).toBe(1);

    // Next -> loop around to index 0 (id: '1')
    act(() => {
      result.current.navigate('next');
    });
    expect(result.current.currentMatchIndex).toBe(0);
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    
    act(() => {
      result.current.handleSearch('world');
    });
    
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.matches).toEqual([]);
    expect(result.current.currentMatchIndex).toBe(-1);
  });

  it('should handle empty messages or no matches', () => {
    const { result } = renderHook(() => useChatSearch(messages));
    
    act(() => {
      result.current.handleSearch('xyz');
    });

    expect(result.current.matches).toEqual([]);
    expect(result.current.currentMatchIndex).toBe(-1);
  });
});
