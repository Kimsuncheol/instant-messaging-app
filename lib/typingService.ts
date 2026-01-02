import { db } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface TypingStatus {
  chatId: string;
  userId: string;
  displayName: string;
  timestamp: Timestamp;
}

// Set typing status for a user in a chat
// Using Firestore for simplicity (Firebase Realtime DB would be faster but requires separate setup)
export const setTyping = async (
  chatId: string,
  userId: string,
  displayName: string
): Promise<void> => {
  const typingRef = doc(db, "typing", `${chatId}_${userId}`);
  await setDoc(typingRef, {
    chatId,
    userId,
    displayName,
    timestamp: serverTimestamp(),
  });
};

// Clear typing status
export const clearTyping = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const typingRef = doc(db, "typing", `${chatId}_${userId}`);
  await deleteDoc(typingRef);
};

// Subscribe to typing status for a chat
export const subscribeToTyping = (
  chatId: string,
  currentUserId: string,
  callback: (typingUsers: string[]) => void
) => {
  const typingRef = collection(db, "typing");
  
  return onSnapshot(typingRef, (snapshot) => {
    const now = Date.now();
    const typingUsers: string[] = [];
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as TypingStatus;
      
      // Only include typing from this chat, not from current user
      if (data.chatId !== chatId || data.userId === currentUserId) return;
      
      // Check if typing status is still valid (within 5 seconds)
      const typingTime = data.timestamp?.toDate?.()?.getTime() || 0;
      if (now - typingTime < 5000) {
        typingUsers.push(data.displayName);
      }
    });
    
    callback(typingUsers);
  });
};

// Debounced typing handler - call this on keypress
let typingTimeout: NodeJS.Timeout | null = null;

export const handleTyping = (
  chatId: string,
  userId: string,
  displayName: string,
  isTyping: boolean
) => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  
  if (isTyping) {
    setTyping(chatId, userId, displayName);
    
    // Auto-clear after 3 seconds
    typingTimeout = setTimeout(() => {
      clearTyping(chatId, userId);
    }, 3000);
  } else {
    clearTyping(chatId, userId);
  }
};
