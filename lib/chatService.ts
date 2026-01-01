import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  Timestamp
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
