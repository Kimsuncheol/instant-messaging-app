import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface StoredMemo {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface MemoInput {
  title: string;
  content: string;
}

/**
 * Save a new memo to user's memo collection
 */
export const saveMemo = async (userId: string, memo: MemoInput): Promise<string> => {
  const memosRef = collection(db, "users", userId, "memos");
  const docRef = await addDoc(memosRef, {
    ...memo,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get all memos for a user
 */
export const getMemos = async (userId: string): Promise<StoredMemo[]> => {
  const memosRef = collection(db, "users", userId, "memos");
  const q = query(memosRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StoredMemo[];
};

/**
 * Update an existing memo
 */
export const updateMemo = async (
  userId: string,
  memoId: string,
  data: Partial<MemoInput>
): Promise<void> => {
  const memoRef = doc(db, "users", userId, "memos", memoId);
  await updateDoc(memoRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a memo
 */
export const deleteMemo = async (userId: string, memoId: string): Promise<void> => {
  const memoRef = doc(db, "users", userId, "memos", memoId);
  await deleteDoc(memoRef);
};

/**
 * Forward a memo to a chat (creates memo message)
 */
export const forwardMemoToChat = async (
  chatId: string,
  senderId: string,
  memo: MemoInput
): Promise<void> => {
  // Import sendMessage from chatService to avoid circular dependency
  const { sendMessage } = await import("./chatService");
  await sendMessage(chatId, senderId, "", undefined, undefined, undefined, undefined, undefined, memo);
};
