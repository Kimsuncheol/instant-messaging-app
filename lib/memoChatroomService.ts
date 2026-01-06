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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

export type IconShape = "folder" | "star" | "bookmark" | "heart" | "lightbulb";

export interface MemoChatroom {
  id: string;
  name: string;
  createdAt: Timestamp;
  messageCount: number;
  pinnedAt?: number; // timestamp when pinned (ms)
  iconColor?: string; // Hex color or preset color
  iconShape?: IconShape; // Icon shape
}

export interface SavedMemo {
  id: string;
  title: string;
  content: string;
  savedAt: Timestamp;
  sourceChatId?: string; // Optional: where the memo was created
}

export interface MemoInput {
  title: string;
  content: string;
  sourceChatId?: string;
}

/**
 * Create a new memo chatroom for a user
 */
export const createMemoChatroom = async (
  userId: string,
  name: string
): Promise<string> => {
  const chatroomsRef = collection(db, "users", userId, "memoChatrooms");
  const docRef = await addDoc(chatroomsRef, {
    name,
    createdAt: serverTimestamp(),
    messageCount: 0,
  });
  return docRef.id;
};

/**
 * Get all memo chatrooms for a user
 */
export const getMemoChatrooms = async (
  userId: string
): Promise<MemoChatroom[]> => {
  const chatroomsRef = collection(db, "users", userId, "memoChatrooms");
  const q = query(chatroomsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MemoChatroom[];
};

/**
 * Subscribe to memo chatrooms in real-time
 */
export const subscribeToMemoChatrooms = (
  userId: string,
  callback: (chatrooms: MemoChatroom[]) => void
): (() => void) => {
  const chatroomsRef = collection(db, "users", userId, "memoChatrooms");
  const q = query(chatroomsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const chatrooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MemoChatroom[];
    callback(chatrooms);
  });
};

/**
 * Save a memo to a specific chatroom
 */
export const saveToMemoChatroom = async (
  userId: string,
  chatroomId: string,
  memo: MemoInput
): Promise<string> => {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages"
  );

  // Add the memo
  const docRef = await addDoc(messagesRef, {
    title: memo.title,
    content: memo.content,
    sourceChatId: memo.sourceChatId || null,
    savedAt: serverTimestamp(),
  });

  // Update message count on chatroom
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  const chatrooms = await getMemoChatrooms(userId);
  const chatroom = chatrooms.find((c) => c.id === chatroomId);
  if (chatroom) {
    await updateDoc(chatroomRef, {
      messageCount: (chatroom.messageCount || 0) + 1,
    });
  }

  return docRef.id;
};

/**
 * Get all memos in a chatroom
 */
export const getMemoMessages = async (
  userId: string,
  chatroomId: string
): Promise<SavedMemo[]> => {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages"
  );
  const q = query(messagesRef, orderBy("savedAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SavedMemo[];
};

/**
 * Subscribe to memos in a chatroom in real-time
 */
export const subscribeToMemoMessages = (
  userId: string,
  chatroomId: string,
  callback: (memos: SavedMemo[]) => void
): (() => void) => {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages"
  );
  const q = query(messagesRef, orderBy("savedAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const memos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavedMemo[];
    callback(memos);
  });
};

/**
 * Delete a memo from a chatroom
 */
export const deleteMemoFromChatroom = async (
  userId: string,
  chatroomId: string,
  memoId: string
): Promise<void> => {
  const memoRef = doc(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages",
    memoId
  );
  await deleteDoc(memoRef);

  // Update message count
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  const chatrooms = await getMemoChatrooms(userId);
  const chatroom = chatrooms.find((c) => c.id === chatroomId);
  if (chatroom && chatroom.messageCount > 0) {
    await updateDoc(chatroomRef, {
      messageCount: chatroom.messageCount - 1,
    });
  }
};

/**
 * Delete an entire memo chatroom and all its messages
 */
export const deleteMemoChatroom = async (
  userId: string,
  chatroomId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // Delete all messages in the chatroom
  const messagesRef = collection(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages"
  );
  const messagesSnapshot = await getDocs(messagesRef);
  messagesSnapshot.docs.forEach((msgDoc) => {
    batch.delete(msgDoc.ref);
  });

  // Delete the chatroom itself
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  batch.delete(chatroomRef);

  await batch.commit();
};

/**
 * Rename a memo chatroom
 */
export const renameMemoChatroom = async (
  userId: string,
  chatroomId: string,
  newName: string
): Promise<void> => {
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  await updateDoc(chatroomRef, { name: newName });
};

/**
 * Ensure default chatroom exists and return all chatrooms
 * Creates "Memo 1" if no chatrooms exist
 */
export const ensureDefaultChatroom = async (
  userId: string
): Promise<MemoChatroom[]> => {
  const chatrooms = await getMemoChatrooms(userId);

  if (chatrooms.length === 0) {
    const newId = await createMemoChatroom(userId, "Memo 1");
    return [
      {
        id: newId,
        name: "Memo 1",
        createdAt: Timestamp.now(),
        messageCount: 0,
      },
    ];
  }

  return chatrooms;
};

/**
 * Get the next auto-generated chatroom name
 */
export const getNextChatroomName = (chatrooms: MemoChatroom[]): string => {
  const memoNumbers = chatrooms
    .map((c) => {
      const match = c.name.match(/^Memo (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNumber = memoNumbers.length > 0 ? Math.max(...memoNumbers) : 0;
  return `Memo ${maxNumber + 1}`;
};

/**
 * Pin a memo chatroom to top
 */
export const pinMemoChatroom = async (
  userId: string,
  chatroomId: string
): Promise<void> => {
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  await updateDoc(chatroomRef, { pinnedAt: Date.now() });
};

/**
 * Unpin a memo chatroom
 */
export const unpinMemoChatroom = async (
  userId: string,
  chatroomId: string
): Promise<void> => {
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  await updateDoc(chatroomRef, { pinnedAt: null });
};

/**
 * Check if a memo chatroom is pinned
 */
export const isMemoChatroomPinned = (chatroom: MemoChatroom): boolean => {
  return chatroom.pinnedAt !== undefined && chatroom.pinnedAt !== null;
};

/**
 * Update a memo in a chatroom
 */
export const updateMemoInChatroom = async (
  userId: string,
  chatroomId: string,
  memoId: string,
  updates: { title?: string; content?: string }
): Promise<void> => {
  const memoRef = doc(
    db,
    "users",
    userId,
    "memoChatrooms",
    chatroomId,
    "messages",
    memoId
  );
  await updateDoc(memoRef, updates);
};

/**
 * Sort chatrooms: pinned first (by pinnedAt desc), then by createdAt asc
 */
export const sortMemoChatrooms = (chatrooms: MemoChatroom[]): MemoChatroom[] => {
  return [...chatrooms].sort((a, b) => {
    const aIsPinned = isMemoChatroomPinned(a);
    const bIsPinned = isMemoChatroomPinned(b);

    // Both pinned: sort by pinnedAt descending (most recently pinned first)
    if (aIsPinned && bIsPinned) {
      return (b.pinnedAt || 0) - (a.pinnedAt || 0);
    }

    // One pinned, one not: pinned comes first
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;

    // Both not pinned: sort by createdAt ascending
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return aTime - bTime;
  });
};

/**
 * Update chatroom icon color and/or shape
 */
export const updateChatroomIcon = async (
  userId: string,
  chatroomId: string,
  updates: { iconColor?: string; iconShape?: IconShape }
): Promise<void> => {
  const chatroomRef = doc(db, "users", userId, "memoChatrooms", chatroomId);
  await updateDoc(chatroomRef, updates);
};
