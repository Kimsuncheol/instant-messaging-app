import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  Timestamp,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";


export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  type: 'private' | 'group';
}

export const createPrivateChat = async (currentUserId: string, otherUserId: string) => {
  const chatsRef = collection(db, "chats");
  
  // Check if chat already exists
  const q = query(
    chatsRef, 
    where("participants", "array-contains", currentUserId),
    where("type", "==", "private")
  );
  
  const querySnapshot = await getDocs(q);
  const existingChat = querySnapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(otherUserId);
  });
  
  if (existingChat) {
    return existingChat.id;
  }
  
  // Create new chat
  const newChat = await addDoc(chatsRef, {
    participants: [currentUserId, otherUserId],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    type: "private",
    createdAt: serverTimestamp(),
  });
  
  return newChat.id;
};

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);
  
  await addDoc(messagesRef, {
    text,
    senderId,
    createdAt: serverTimestamp(),
  });
  
  // Update last message in chat
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToChats = (
  userId: string, 
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef, 
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
    callback(chats);
  });
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);
  
  if (!chatDoc.exists()) return null;
  
  return {
    id: chatDoc.id,
    ...chatDoc.data(),
  } as Chat;
};
