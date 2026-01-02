import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export interface Group {
  id: string;
  name: string;
  description?: string;
  photoURL?: string;
  creatorId: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: Timestamp;
}

// Create a new group and corresponding group chat
export const createGroup = async (
  name: string,
  creatorId: string,
  memberIds: string[],
  description?: string,
  photoURL?: string
): Promise<string> => {
  // Ensure creator is in the member list
  const allMemberIds = [...new Set([creatorId, ...memberIds])];

  // Create the group chat
  const chatsRef = collection(db, "chats");
  const unreadCounts: Record<string, number> = {};
  allMemberIds.forEach((id) => {
    unreadCounts[id] = 0;
  });

  const newChat = await addDoc(chatsRef, {
    participants: allMemberIds,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    type: "group",
    createdAt: serverTimestamp(),
    unreadCounts,
    // Group-specific fields
    groupName: name,
    groupDescription: description || "",
    groupPhotoURL: photoURL || "",
    groupCreatorId: creatorId,
    groupAdminIds: [creatorId],
  });

  return newChat.id;
};

// Get group details from a chat
export const getGroupFromChat = async (chatId: string): Promise<Group | null> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) return null;

  const data = chatDoc.data();
  if (data.type !== "group") return null;

  return {
    id: chatDoc.id,
    name: data.groupName || "Unnamed Group",
    description: data.groupDescription,
    photoURL: data.groupPhotoURL,
    creatorId: data.groupCreatorId,
    adminIds: data.groupAdminIds || [],
    memberIds: data.participants || [],
    createdAt: data.createdAt,
  };
};

// Update group info
export const updateGroup = async (
  chatId: string,
  updates: {
    name?: string;
    description?: string;
    photoURL?: string;
  }
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const updateData: Record<string, string> = {};

  if (updates.name !== undefined) {
    updateData.groupName = updates.name;
  }
  if (updates.description !== undefined) {
    updateData.groupDescription = updates.description;
  }
  if (updates.photoURL !== undefined) {
    updateData.groupPhotoURL = updates.photoURL;
  }

  await updateDoc(chatRef, updateData);
};

// Add member to group
export const addMemberToGroup = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) throw new Error("Group not found");

  const data = chatDoc.data();
  if (data.type !== "group") throw new Error("Not a group chat");

  // Add to participants and initialize unread count
  const unreadCounts = { ...(data.unreadCounts || {}) };
  unreadCounts[userId] = 0;

  await updateDoc(chatRef, {
    participants: arrayUnion(userId),
    unreadCounts,
  });
};

// Remove member from group
export const removeMemberFromGroup = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) throw new Error("Group not found");

  const data = chatDoc.data();
  if (data.type !== "group") throw new Error("Not a group chat");

  // Remove from participants and unread counts
  const unreadCounts = { ...(data.unreadCounts || {}) };
  delete unreadCounts[userId];

  await updateDoc(chatRef, {
    participants: arrayRemove(userId),
    groupAdminIds: arrayRemove(userId),
    unreadCounts,
  });
};

// Make user an admin
export const makeGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    groupAdminIds: arrayUnion(userId),
  });
};

// Remove admin privileges
export const removeGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    groupAdminIds: arrayRemove(userId),
  });
};

// Check if user is admin
export const isGroupAdmin = async (
  chatId: string,
  userId: string
): Promise<boolean> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) return false;

  const data = chatDoc.data();
  return data.groupAdminIds?.includes(userId) || false;
};

// Get all groups for a user
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    where("type", "==", "group")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.groupName || "Unnamed Group",
      description: data.groupDescription,
      photoURL: data.groupPhotoURL,
      creatorId: data.groupCreatorId,
      adminIds: data.groupAdminIds || [],
      memberIds: data.participants || [],
      createdAt: data.createdAt,
    };
  });
};
