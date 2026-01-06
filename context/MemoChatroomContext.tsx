"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  MemoChatroom,
  SavedMemo,
  subscribeToMemoChatrooms,
  createMemoChatroom,
  ensureDefaultChatroom,
  saveToMemoChatroom,
  deleteMemoChatroom,
  renameMemoChatroom,
  getNextChatroomName,
  subscribeToMemoMessages,
  deleteMemoFromChatroom,
  pinMemoChatroom,
  unpinMemoChatroom,
  updateMemoInChatroom,
  updateChatroomIcon,
  sortMemoChatrooms,
  isMemoChatroomPinned,
  IconShape,
  MemoInput,
} from "@/lib/memoChatroomService";

interface MemoChatroomContextType {
  // Chatrooms
  chatrooms: MemoChatroom[];
  loading: boolean;
  selectedChatroomId: string | null;
  selectChatroom: (id: string | null) => void;

  // Chatroom operations
  createNewChatroom: () => Promise<string>;
  deleteChatroom: (id: string) => Promise<void>;
  renameChatroom: (id: string, name: string) => Promise<void>;
  pinChatroom: (id: string) => Promise<void>;
  unpinChatroom: (id: string) => Promise<void>;
  isChatroomPinned: (chatroom: MemoChatroom) => boolean;
  updateChatroomIcon: (
    id: string,
    updates: { iconColor?: string; iconShape?: IconShape }
  ) => Promise<void>;

  // Memo operations
  saveMemoToChatroom: (chatroomId: string, memo: MemoInput) => Promise<string>;
  deleteMemo: (chatroomId: string, memoId: string) => Promise<void>;
  editMemo: (
    chatroomId: string,
    memoId: string,
    updates: { title?: string; content?: string }
  ) => Promise<void>;

  // Current chatroom's memos
  currentMemos: SavedMemo[];
  memosLoading: boolean;
}

const MemoChatroomContext = createContext<MemoChatroomContextType | undefined>(
  undefined
);

export const MemoChatroomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [chatrooms, setChatrooms] = useState<MemoChatroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatroomId, setSelectedChatroomId] = useState<string | null>(
    null
  );
  const [currentMemos, setCurrentMemos] = useState<SavedMemo[]>([]);
  const [memosLoading, setMemosLoading] = useState(false);

  // Initialize - ensure default chatroom exists
  useEffect(() => {
    if (!user) return;

    // Ensure default chatroom exists first
    const initChatrooms = async () => {
      await ensureDefaultChatroom(user.uid);
    };

    initChatrooms();

    // Subscribe to chatrooms
    const unsubscribe = subscribeToMemoChatrooms(user.uid, (rooms) => {
      // Sort chatrooms: pinned first, then by createdAt
      setChatrooms(sortMemoChatrooms(rooms));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to memos when a chatroom is selected
  useEffect(() => {
    if (!user || !selectedChatroomId) return;

    const unsubscribe = subscribeToMemoMessages(
      user.uid,
      selectedChatroomId,
      (memos) => {
        setCurrentMemos(memos);
        setMemosLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedChatroomId]);

  const selectChatroom = useCallback((id: string | null) => {
    setSelectedChatroomId(id);
  }, []);

  const createNewChatroom = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const name = getNextChatroomName(chatrooms);
    const id = await createMemoChatroom(user.uid, name);
    return id;
  }, [user, chatrooms]);

  const deleteChatroom = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await deleteMemoChatroom(user.uid, id);
      if (selectedChatroomId === id) {
        setSelectedChatroomId(null);
      }
    },
    [user, selectedChatroomId]
  );

  const renameChatroom = useCallback(
    async (id: string, name: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await renameMemoChatroom(user.uid, id, name);
    },
    [user]
  );

  const saveMemoToChatroom = useCallback(
    async (chatroomId: string, memo: MemoInput): Promise<string> => {
      if (!user) throw new Error("Not authenticated");
      return await saveToMemoChatroom(user.uid, chatroomId, memo);
    },
    [user]
  );

  const deleteMemo = useCallback(
    async (chatroomId: string, memoId: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await deleteMemoFromChatroom(user.uid, chatroomId, memoId);
    },
    [user]
  );

  const editMemo = useCallback(
    async (
      chatroomId: string,
      memoId: string,
      updates: { title?: string; content?: string }
    ): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await updateMemoInChatroom(user.uid, chatroomId, memoId, updates);
    },
    [user]
  );

  const pinChatroom = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await pinMemoChatroom(user.uid, id);
    },
    [user]
  );

  const unpinChatroom = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await unpinMemoChatroom(user.uid, id);
    },
    [user]
  );

  const isChatroomPinned = useCallback((chatroom: MemoChatroom): boolean => {
    return isMemoChatroomPinned(chatroom);
  }, []);

  const updateIcon = useCallback(
    async (
      id: string,
      updates: { iconColor?: string; iconShape?: IconShape }
    ): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      await updateChatroomIcon(user.uid, id, updates);
    },
    [user]
  );

  return (
    <MemoChatroomContext.Provider
      value={{
        chatrooms,
        loading,
        selectedChatroomId,
        selectChatroom,
        createNewChatroom,
        deleteChatroom,
        renameChatroom,
        pinChatroom,
        unpinChatroom,
        isChatroomPinned,
        updateChatroomIcon: updateIcon,
        saveMemoToChatroom,
        deleteMemo,
        editMemo,
        currentMemos,
        memosLoading,
      }}
    >
      {children}
    </MemoChatroomContext.Provider>
  );
};

export const useMemoChatroom = () => {
  const context = useContext(MemoChatroomContext);
  if (!context) {
    throw new Error(
      "useMemoChatroom must be used within a MemoChatroomProvider"
    );
  }
  return context;
};
