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
  arrayUnion,
  arrayRemove,
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
  pinnedBy?: string[]; // Array of user IDs who have pinned this friendship
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

  const existingRequests = await getDocs(existingQuery);

  if (!existingRequests.empty) {
    throw new Error("Friend request already sent");
  }

  // Check if there's a reverse request (from toUser to fromUser)
  const reverseQuery = query(
    requestsRef,
    where("fromUserId", "==", toUserId),
    where("toUserId", "==", fromUserId),
    where("status", "==", "pending")
  );

  const reverseRequests = await getDocs(reverseQuery);

  if (!reverseRequests.empty) {
    throw new Error("This user has already sent you a friend request");
  }

  // Check if they're already friends
  const friendshipCheck = await getFriendshipByUsers(fromUserId, toUserId);
  if (friendshipCheck) {
    throw new Error("You are already friends with this user");
  }

  // Create the friend request
  const docRef = await addDoc(requestsRef, {
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, "friendRequests", requestId);
  const requestDoc = await getDoc(requestRef);

  if (!requestDoc.exists()) {
    throw new Error("Friend request not found");
  }

  const data = requestDoc.data() as FriendRequest;

  // Create friendship
  await addDoc(collection(db, "friendships"), {
    users: [data.fromUserId, data.toUserId],
    createdAt: serverTimestamp(),
  });

  // Update request status
  await updateDoc(requestRef, { status: "accepted" });
};

// Reject a friend request
export const rejectFriendRequest = async (
  requestId: string
): Promise<void> => {
  const requestRef = doc(db, "friendRequests", requestId);
  await updateDoc(requestRef, { status: "rejected" });
};

// Get friends list for a user
export const getFriends = async (userId: string): Promise<Friend[]> => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId));
  const snapshot = await getDocs(q);

  const friends: Friend[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    const otherUserId = data.users.find((id: string) => id !== userId);
    return {
      id: `${userId}_${otherUserId}`,
      odUserId: otherUserId || "",
      friendshipId: doc.id,
      createdAt: data.createdAt,
    };
  });

  return friends;
};

// Subscribe to friends (real-time)
export const subscribeToFriends = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  const friendshipsRef = collection(db, "friendships");
  const q = query(friendshipsRef, where("users", "array-contains", userId));

  return onSnapshot(q, (snapshot) => {
    const friends: Friend[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const otherUserId = data.users.find((id: string) => id !== userId);
      return {
        id: `${userId}_${otherUserId}`,
        odUserId: otherUserId || "",
        friendshipId: doc.id,
        createdAt: data.createdAt,
      };
    });

    callback(friends);
  });
};

// Subscribe to friend requests
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
    const requests: FriendRequest[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FriendRequest, "id">),
    }));

    callback(requests);
  });
};

// Subscribe to sent requests
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
    const requests: FriendRequest[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FriendRequest, "id">),
    }));

    callback(requests);
  });
};

// Remove a friend
export const removeFriend = async (friendshipId: string): Promise<void> => {
  const friendshipRef = doc(db, "friendships", friendshipId);
  await deleteDoc(friendshipRef);
};

// Block a user
export const blockUser = async (
  userId: string,
  blockedUserId: string
): Promise<void> => {
  const blocksRef = collection(db, "blockedUsers");
  await addDoc(blocksRef, {
    userId,
    blockedUserId,
    createdAt: serverTimestamp(),
  });

  // Remove friendship if exists
  const friendship = await getFriendshipByUsers(userId, blockedUserId);
  if (friendship) {
    await removeFriend(friendship.id);
  }
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
  snapshot.forEach((doc) => deleteDoc(doc.ref));
};

// Check if a user is blocked
export const isBlocked = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  const blocksRef = collection(db, "blockedUsers");
  const q1 = query(
    blocksRef,
    where("userId", "==", userId),
    where("blockedUserId", "==", otherUserId)
  );
  const q2 = query(
    blocksRef,
    where("userId", "==", otherUserId),
    where("blockedUserId", "==", userId)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  return !snapshot1.empty || !snapshot2.empty;
};

// Get blocked users
export const getBlockedUsers = async (userId: string): Promise<string[]> => {
  const blocksRef = collection(db, "blockedUsers");
  const q = query(blocksRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().blockedUserId);
};

// Subscribe to blocked users
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

// Check if two users are friends
export const areFriends = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  const friendship = await getFriendshipByUsers(userId1, userId2);
  return friendship !== null;
};

// Pin a friend
export const pinFriend = async (
  friendshipId: string,
  userId: string
): Promise<void> => {
  const friendshipRef = doc(db, "friendships", friendshipId);
  await updateDoc(friendshipRef, {
    pinnedBy: arrayUnion(userId),
  });
};

// Unpin a friend
export const unpinFriend = async (
  friendshipId: string,
  userId: string
): Promise<void> => {
  const friendshipRef = doc(db, "friendships", friendshipId);
  await updateDoc(friendshipRef, {
    pinnedBy: arrayRemove(userId),
  });
};
