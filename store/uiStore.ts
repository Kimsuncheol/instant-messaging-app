import { create } from 'zustand';

interface UiState {
  headerHeightA: number;
  footerHeightB: number;
  activeMobileTab: 'chats' | 'friends';
  setHeaderHeightA: (height: number) => void;
  setFooterHeightB: (height: number) => void;
  setActiveMobileTab: (tab: 'chats' | 'friends') => void;
}

export const useUiStore = create<UiState>((set) => ({
  headerHeightA: 60, // Default fallback
  footerHeightB: 60, // Default fallback
  activeMobileTab: 'friends', // Default to friends list (or chats, user choice. Friends is current default)
  setHeaderHeightA: (height) => set({ headerHeightA: height }),
  setFooterHeightB: (height) => set({ footerHeightB: height }),
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
}));
