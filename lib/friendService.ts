import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}

export interface Friend {
  id: string;
  odUserId: string; // The other user in the friendship
  friendshipId: string;
  createdAt: Timestamp;
}

export interface Friendship {
  id: string;
  users: string[]; // Array of two user IDs
  createdAt: Timestamp;
}

// Send a friend request
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<string> => {
  // Check if a request already exists
  const requestsRef = collection(db, "friendRequests");
  const existingQuery = query(
    requestsRef,
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );

  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    throw new Error("Friend request already sent");
  }

  // Check if already friends
  const friendshipsRef = collection(db, "friendships");
  const friendshipQuery = query(
    friendshipsRef,
    where("users", "array-contains", fromUserId)
  );
  const friendshipDocs = await getDocs(friendshipQuery);
  const alreadyFriends = friendshipDocs.docs.some((doc) => {
    const data = doc.data();
    return data.users.includes(toUserId);
  });

  if (alreadyFriends) {
    throw new Error("Already friends with this user");
  }

  // Create the friend request
  const newRequest = await addDoc(requestsRef, {
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return newRequest.id;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, "friendRequests", requestId);
  const requestDoc = await getDoc(requestRef);

  if (!requestDoc.exists()) {
    throw new Error("Friend request not found");
  }

  const requestData = requestDoc.data() as FriendRequest;

  // Create friendship
  const friendshipsRef = collection(db, "friendships");
  await addDoc(friendshipsRef, {
    users: [requestData.fromUserId, requestData.toUserId],
    createdAt: serverTimestamp(),
  });

  // Update request status
  await updateDoc(requestRef, {
    status: "accepted",
  });
};

// Reject a friend request
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, "friendRequests", requestId);
  await updateDoc(requestRef, {
    status: "rejected",
  });
};

// Delete a friend request (cancel)
export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, "friendRequests", requestId);
  await deleteDoc(requestRef);
};

// Remove a friend
export const removeFriend = async (friendshipId: string): Promise<void> => {
  const friendshipRef = doc(db, "friendships", friendshipId);
  await deleteDoc(friendshipRef);
};

// Get friends list for a user
export const getFriends = async (userId: string): Promise<Friend[]> => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const otherUserId = data.users.find((id: string) => id !== userId);
    return {
      id: doc.id,
      odUserId: otherUserId,
      friendshipId: doc.id,
      createdAt: data.createdAt,
    };
  });
};

// Subscribe to friends list (real-time)
export const subscribeToFriends = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId));

  return onSnapshot(q, (snapshot) => {
    const friends = snapshot.docs.map((doc) => {
      const data = doc.data();
      const otherUserId = data.users.find((id: string) => id !== userId);
      return {
        id: doc.id,
        odUserId: otherUserId,
        friendshipId: doc.id,
        createdAt: data.createdAt,
      };
    });
    callback(friends);
  });
};

// Subscribe to incoming friend requests (real-time)
export const subscribeToFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const requestsRef = collection(db, "friendRequests");
  const q = query(
    requestsRef,
    where("toUserId", "==", userId),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FriendRequest[];
    callback(requests);
  });
};

// Subscribe to sent friend requests (real-time)
export const subscribeToSentRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const requestsRef = collection(db, "friendRequests");
  const q = query(
    requestsRef,
    where("fromUserId", "==", userId),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FriendRequest[];
    callback(requests);
  });
};

// Check if two users are friends
export const areFriends = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId1));

  const snapshot = await getDocs(q);
  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return data.users.includes(userId2);
  });
};

// Get pending request between two users
export const getPendingRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<FriendRequest | null> => {
  const requestsRef = collection(db, "friendRequests");
  const q = query(
    requestsRef,
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as FriendRequest;
};

// Block a user
export const blockUser = async (
  userId: string,
  blockedUserId: string
): Promise<void> => {
  const blocksRef = collection(db, "blockedUsers");
  
  // Check if already blocked
  const q = query(
    blocksRef,
    where("userId", "==", userId),
    where("blockedUserId", "==", blockedUserId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return; // Already blocked
  
  await addDoc(blocksRef, {
    userId,
    blockedUserId,
    createdAt: serverTimestamp(),
  });
};

// Unblock a user
export const unblockUser = async (
  userId: string,
  blockedUserId: string
): Promise<void> => {
  const blocksRef = collection(db, "blockedUsers");
  const q = query(
    blocksRef,
    where("userId", "==", userId),
    where("blockedUserId", "==", blockedUserId)
  );
  
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(async (docSnap) => {
    await deleteDoc(doc(db, "blockedUsers", docSnap.id));
  });
};

// Check if a user is blocked
export const isBlocked = async (
  userId: string,
  targetUserId: string
): Promise<boolean> => {
  const blocksRef = collection(db, "blockedUsers");
  const q = query(
    blocksRef,
    where("userId", "==", userId),
    where("blockedUserId", "==", targetUserId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Get list of blocked users
export const getBlockedUsers = async (userId: string): Promise<string[]> => {
  const blocksRef = collection(db, "blockedUsers");
  const q = query(blocksRef, where("userId", "==", userId));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().blockedUserId);
};

// Subscribe to blocked users (real-time)
export const subscribeToBlockedUsers = (
  userId: string,
  callback: (blockedIds: string[]) => void
) => {
  const blocksRef = collection(db, "blockedUsers");
  const q = query(blocksRef, where("userId", "==", userId));
  
  return onSnapshot(q, (snapshot) => {
    const blockedIds = snapshot.docs.map((doc) => doc.data().blockedUserId);
    callback(blockedIds);
  });
};

// Get friendship by user IDs
export const getFriendshipByUsers = async (
  userId1: string,
  userId2: string
): Promise<{ id: string } | null> => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId1));
  
  const snapshot = await getDocs(q);
  const friendship = snapshot.docs.find((doc) => {
    const data = doc.data();
    return data.users.includes(userId2);
  });
  
  return friendship ? { id: friendship.id } : null;
};
