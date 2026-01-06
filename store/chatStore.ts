import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabFilter = "all" | "unread" | "groups" | "favourites" | "saved";

interface ChatState {
  selectedChatId: string | null;
  activeTab: TabFilter;
  setSelectedChatId: (chatId: string | null) => void;
  setActiveTab: (tab: TabFilter) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      selectedChatId: null,
      activeTab: "all",
      setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "chat-storage", // localStorage key
      partialize: (state) => ({ activeTab: state.activeTab }), // Only persist activeTab
    }
  )
);
