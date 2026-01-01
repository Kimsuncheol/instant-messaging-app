import { db } from "./firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";


export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  const usersRef = collection(db, "users");
  
  // Query 1: Search by email
  const qEmail = query(
    usersRef, 
    where("email", ">=", searchTerm), 
    where("email", "<=", searchTerm + "\uf8ff"),
    limit(10)
  );
  
  // Query 2: Search by displayName
  const qName = query(
    usersRef, 
    where("displayName", ">=", searchTerm), 
    where("displayName", "<=", searchTerm + "\uf8ff"),
    limit(10)
  );
  
  const [emailSnap, nameSnap] = await Promise.all([
    getDocs(qEmail),
    getDocs(qName)
  ]);
  
  const userMap = new Map<string, UserProfile>();
  
  emailSnap.forEach((doc) => {
    userMap.set(doc.id, doc.data() as UserProfile);
  });
  
  nameSnap.forEach((doc) => {
    userMap.set(doc.id, doc.data() as UserProfile);
  });
  
  return Array.from(userMap.values()).slice(0, 10);
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return null;
  
  return userDoc.data() as UserProfile;
};
