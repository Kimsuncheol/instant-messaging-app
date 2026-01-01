import { create } from "zustand";

interface ChatState {
  selectedChatId: string | null;
  setSelectedChatId: (chatId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedChatId: null,
  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
}));
