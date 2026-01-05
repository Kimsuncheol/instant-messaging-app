import { useState, useEffect, useCallback, useMemo } from 'react';
import { Message } from '../chatService';

interface UseChatSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  matches: string[];
  currentMatchIndex: number;
  currentMatchId: string | null;
  navigate: (direction: 'next' | 'prev') => void;
  handleSearch: (term: string) => void;
  clearSearch: () => void;
}

export const useChatSearch = (messages: Message[]): UseChatSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  const matches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return messages
      .filter(msg => msg.text && msg.text.toLowerCase().includes(term))
      .map(msg => msg.id);
  }, [searchTerm, messages]);

  useEffect(() => {
    // Reset or update selection when matches change
    if (matches.length > 0) {
      setCurrentMatchIndex(matches.length - 1);
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [matches]);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (matches.length === 0) return;

    setCurrentMatchIndex(prev => {
      if (direction === 'next') { // "Next" usually means "newer" (down) or "next result"? 
        // Let's treat "next" as "next occurrence in the list", wrapping around
        return (prev + 1) % matches.length;
      } else {
        return (prev - 1 + matches.length) % matches.length;
      }
    });
  }, [matches]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    // matches will auto-update because it's derived from searchTerm
    setCurrentMatchIndex(-1);
  };

  const currentMatchId = matches[currentMatchIndex] || null;

  return {
    searchTerm,
    setSearchTerm,
    matches,
    currentMatchIndex,
    currentMatchId,
    navigate,
    handleSearch,
    clearSearch,
  };
};
