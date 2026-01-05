"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { 
  saveMemo, 
  getMemos, 
  updateMemo, 
  deleteMemo, 
  StoredMemo, 
  MemoInput 
} from "@/lib/memoService";

interface MemoDraft {
  id: string;
  title: string;
  content: string;
  isDraft: true;
}

interface MemoContextType {
  // Stored memos (Firebase)
  memos: StoredMemo[];
  loadMemos: () => Promise<void>;
  addMemo: (memo: MemoInput) => Promise<string>;
  editMemo: (memoId: string, data: Partial<MemoInput>) => Promise<void>;
  removeMemo: (memoId: string) => Promise<void>;
  
  // Draft memos (local temp storage)
  drafts: MemoDraft[];
  saveDraft: (draft: Omit<MemoDraft, "id" | "isDraft">) => string;
  updateDraft: (id: string, data: Partial<Omit<MemoDraft, "id" | "isDraft">>) => void;
  removeDraft: (id: string) => void;
  clearDrafts: () => void;
  
  // Loading state
  loading: boolean;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export const MemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [memos, setMemos] = useState<StoredMemo[]>([]);
  const [drafts, setDrafts] = useState<MemoDraft[]>([]);
  const [loading, setLoading] = useState(false);

  // Load memos from Firebase
  const loadMemos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedMemos = await getMemos(user.uid);
      setMemos(fetchedMemos);
    } catch (error) {
      console.error("Error loading memos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load memos on mount
  useEffect(() => {
    if (user) {
      loadMemos();
    }
  }, [user, loadMemos]);

  // Load drafts from localStorage
  useEffect(() => {
    const storedDrafts = localStorage.getItem("memo_drafts");
    if (storedDrafts) {
      try {
        setDrafts(JSON.parse(storedDrafts));
      } catch {
        console.error("Failed to parse drafts");
      }
    }
  }, []);

  // Persist drafts to localStorage
  useEffect(() => {
    localStorage.setItem("memo_drafts", JSON.stringify(drafts));
  }, [drafts]);

  // Add memo to Firebase
  const addMemo = async (memo: MemoInput): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const id = await saveMemo(user.uid, memo);
    await loadMemos();
    return id;
  };

  // Edit memo in Firebase
  const editMemo = async (memoId: string, data: Partial<MemoInput>): Promise<void> => {
    if (!user) throw new Error("Not authenticated");
    await updateMemo(user.uid, memoId, data);
    await loadMemos();
  };

  // Remove memo from Firebase
  const removeMemo = async (memoId: string): Promise<void> => {
    if (!user) throw new Error("Not authenticated");
    await deleteMemo(user.uid, memoId);
    await loadMemos();
  };

  // Save draft locally
  const saveDraft = (draft: Omit<MemoDraft, "id" | "isDraft">): string => {
    const id = `draft_${Date.now()}`;
    setDrafts((prev) => [...prev, { ...draft, id, isDraft: true }]);
    return id;
  };

  // Update draft
  const updateDraft = (id: string, data: Partial<Omit<MemoDraft, "id" | "isDraft">>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
  };

  // Remove draft
  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  // Clear all drafts
  const clearDrafts = () => {
    setDrafts([]);
  };

  return (
    <MemoContext.Provider
      value={{
        memos,
        loadMemos,
        addMemo,
        editMemo,
        removeMemo,
        drafts,
        saveDraft,
        updateDraft,
        removeDraft,
        clearDrafts,
        loading,
      }}
    >
      {children}
    </MemoContext.Provider>
  );
};

export const useMemo = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemo must be used within a MemoProvider");
  }
  return context;
};
