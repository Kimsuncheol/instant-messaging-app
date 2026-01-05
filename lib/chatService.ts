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
  getDoc,
  writeBatch,
  arrayUnion
} from "firebase/firestore";
import { uploadMedia } from "./mediaService";


export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  type: 'private' | 'group';
  unreadCounts?: Record<string, number>; // userId -> unread count
  // Group-specific fields (only present for group chats)
  groupName?: string;
  groupDescription?: string;
  groupPhotoURL?: string;
  groupCreatorId?: string;
  groupAdminIds?: string[];
  // Chat management fields
  pinnedAt?: Record<string, number>; // userId -> timestamp when pinned (ms)
  mutedBy?: string[]; // Array of user IDs who muted this chat
  favouritedBy?: string[]; // Array of user IDs who favorited this chat
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // Array of user IDs who voted for this option
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  allowMultipleVotes: boolean;
  totalVotes: number;
}

export interface EventAttendee {
  userId: string;
  status: 'going' | 'maybe' | 'declined';
  updatedAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  allDay: boolean;
  createdBy: string;
  createdAt: Timestamp;
  attendees: EventAttendee[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ContactData {
  userId: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface MemoData {
  title: string;
  content: string;
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
  
  // Create new chat with initial unread counts
  const unreadCounts: Record<string, number> = {};
  unreadCounts[currentUserId] = 0;
  unreadCounts[otherUserId] = 0;
  
  const newChat = await addDoc(chatsRef, {
    participants: [currentUserId, otherUserId],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    type: "private",
    createdAt: serverTimestamp(),
    unreadCounts,
  });
  
  return newChat.id;
};

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  readBy: string[]; // Array of user IDs who have read this message
  // Extended fields
  editedAt?: Timestamp; // When message was edited
  deleted?: boolean; // Soft delete flag
  reactions?: Record<string, string[]>; // emoji -> userIds who reacted
  forwardedFrom?: { chatId: string; messageId: string }; // If forwarded
  // Call notification fields
  callData?: {
    type: "voice" | "video";
    status: "missed" | "declined" | "ended";
    duration?: number; // in seconds, for ended calls
    callerId: string;
  };
  // Poll data
  poll?: Poll;
  // Event data
  event?: Event;
  // Location data
  location?: LocationData;
  // Contact data
  contact?: ContactData;
  // Memo data
  memo?: MemoData;
}

export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  text: string,
  poll?: Omit<Poll, "id" | "totalVotes" | "createdAt">,
  event?: Omit<Event, "id" | "createdAt">,
  file?: File,
  location?: LocationData,
  contact?: ContactData,
  memo?: MemoData
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);
  
  // Get chat to find other participants
  const chatDoc = await getDoc(chatRef);
  if (!chatDoc.exists()) return;
  
  const chatData = chatDoc.data();
  const otherParticipants = chatData.participants.filter((p: string) => p !== senderId);
  
  // Prepare message data
  let imageUrl = "";
  if (file) {
    try {
      imageUrl = await uploadMedia(file, `chats/${chatId}/images`);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  const messageData: Record<string, unknown> = {
    text,
    senderId,
    createdAt: serverTimestamp(),
    readBy: [senderId],
    type: location ? "location" : (file ? "image" : "text"),
    image: imageUrl || null,
  };

  // Add location if provided
  if (location) {
    messageData.location = location;
  }

  // Add contact if provided
  if (contact) {
    messageData.contact = contact;
    messageData.type = "contact";
  }

  // Add memo if provided
  if (memo) {
    messageData.memo = memo;
    messageData.type = "memo";
  }
  
  // Add poll if provided
  if (poll) {
    messageData.poll = {
      ...poll,
      id: `poll_${Date.now()}`,
      totalVotes: 0,
      createdAt: serverTimestamp(),
    };
  }

  // Add event if provided
  if (event) {
    messageData.event = {
      ...event,
      id: `event_${Date.now()}`,
      createdAt: serverTimestamp(),
    };
  }
  
  // Add message with readBy initialized to sender only
  await addDoc(messagesRef, messageData);
  
  // Update last message and increment unread counts for other participants
  const unreadCounts = { ...(chatData.unreadCounts || {}) };
  otherParticipants.forEach((userId: string) => {
    unreadCounts[userId] = (unreadCounts[userId] || 0) + 1;
  });
  
  let lastMessageText = text;
  if (poll) lastMessageText = "📊 Poll";
  else if (event) lastMessageText = "📅 Event";

  await updateDoc(chatRef, {
    lastMessage: lastMessageText,
    lastMessageAt: serverTimestamp(),
    unreadCounts,
  });
};

export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        text: data.text || '',
        senderId: data.senderId || '',
        createdAt: data.createdAt,
        readBy: data.readBy || [],
      } as Message;
    });
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

// Mark all messages in a chat as read for a specific user
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  
  // Since we can't query for "not contains", we'll mark all messages and reset the count
  const allMessagesSnap = await getDocs(collection(db, "chats", chatId, "messages"));
  const batch = writeBatch(db);
  
  allMessagesSnap.docs.forEach((msgDoc) => {
    const msgData = msgDoc.data();
    if (!msgData.readBy?.includes(userId)) {
      batch.update(msgDoc.ref, {
        readBy: arrayUnion(userId)
      });
    }
  });
  
  // Reset unread count for this user
  const chatDoc = await getDoc(chatRef);
  if (chatDoc.exists()) {
    const chatData = chatDoc.data();
    const unreadCounts = { ...(chatData.unreadCounts || {}) };
    unreadCounts[userId] = 0;
    batch.update(chatRef, { unreadCounts });
  }
  
  await batch.commit();
};

// Mark all chats as read for a user
export const markAllChatsAsRead = async (userId: string): Promise<void> => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", userId));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((chatDoc) => {
    const chatData = chatDoc.data();
    const unreadCounts = { ...(chatData.unreadCounts || {}) };
    if (unreadCounts[userId] && unreadCounts[userId] > 0) {
      unreadCounts[userId] = 0;
      batch.update(chatDoc.ref, { unreadCounts });
    }
  });
  
  await batch.commit();
};

// Get unread count for a specific chat and user
export const getUnreadCount = (chat: Chat, userId: string): number => {
  return chat.unreadCounts?.[userId] || 0;
};

// Pin a chat for a user
export const pinChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);
  if (!chatDoc.exists()) return;
  
  const chatData = chatDoc.data();
  const pinnedAt = { ...(chatData.pinnedAt || {}) };
  pinnedAt[userId] = Date.now();
  
  await updateDoc(chatRef, { pinnedAt });
};

// Unpin a chat for a user
export const unpinChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);
  if (!chatDoc.exists()) return;
  
  const chatData = chatDoc.data();
  const pinnedAt = { ...(chatData.pinnedAt || {}) };
  delete pinnedAt[userId];
  
  await updateDoc(chatRef, { pinnedAt });
};

/**
 * Vote on a poll option
 */
export const voteOnPoll = async (
  chatId: string,
  messageId: string,
  optionId: string,
  userId: string,
  allowMultipleVotes: boolean
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (!messageDoc.exists()) {
    throw new Error("Message not found");
  }
  
  const messageData = messageDoc.data() as Message;
  if (!messageData.poll) {
    throw new Error("Message does not contain a poll");
  }
  
  const poll = messageData.poll;
  const updatedOptions = poll.options.map(option => {
    // If not allowing multiple votes, remove user from all other options
    if (!allowMultipleVotes && option.id !== optionId) {
      return {
        ...option,
        votes: option.votes.filter(id => id !== userId)
      };
    }
    
    // Toggle vote on the selected option
    if (option.id === optionId) {
      const hasVoted = option.votes.includes(userId);
      return {
        ...option,
        votes: hasVoted 
          ? option.votes.filter(id => id !== userId)  // Remove vote
          : [...option.votes, userId]  // Add vote
      };
    }
    
    return option;
  });
  
  // Calculate total votes
  const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
  
  await updateDoc(messageRef, {
    "poll.options": updatedOptions,
    "poll.totalVotes": totalVotes,
  });
};

/**
 * Calculate poll results with percentages
 */
export const calculatePollResults = (poll: Poll): Array<{
  optionId: string;
  text: string;
  voteCount: number;
  percentage: number;
  hasUserVoted: (userId: string) => boolean;
}> => {
  const total = poll.totalVotes || 1; // Avoid division by zero
  
  return poll.options.map(option => ({
    optionId: option.id,
    text: option.text,
    voteCount: option.votes.length,
    percentage: (option.votes.length / total) * 100,
    hasUserVoted: (userId: string) => option.votes.includes(userId),
  }));
};

/**
 * RSVP to an event
 */
export const rsvpToEvent = async (
  chatId: string,
  messageId: string,
  userId: string,
  status: 'going' | 'maybe' | 'declined'
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (!messageDoc.exists()) {
    throw new Error("Message not found");
  }
  
  const messageData = messageDoc.data() as Message;
  if (!messageData.event) {
    throw new Error("Message does not contain an event");
  }
  
  const event = messageData.event;
  const existingAttendeeIndex = event.attendees.findIndex(a => a.userId === userId);
  
  // Use a temporary object for the update to avoid type mismatch between Timestamp and FieldValue
  const newAttendeeData = {
    userId,
    status,
    updatedAt: serverTimestamp(),
  };

  const updatedAttendees = [...event.attendees];
  // Helper to safely update array with mixed Timestamp/FieldValue types during write
  const safeAttendee = newAttendeeData as unknown as EventAttendee;
  
  if (existingAttendeeIndex >= 0) {
    updatedAttendees[existingAttendeeIndex] = safeAttendee;
  } else {
    updatedAttendees.push(safeAttendee);
  }
  
  await updateDoc(messageRef, {
    "event.attendees": updatedAttendees,
  });
};

// Mute a chat for a user
export const muteChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    mutedBy: arrayUnion(userId),
  });
};

// Unmute a chat for a user
export const unmuteChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const { arrayRemove } = await import("firebase/firestore");
  await updateDoc(chatRef, {
    mutedBy: arrayRemove(userId),
  });
};

// Check if chat is pinned by user
export const isPinned = (chat: Chat, userId: string): boolean => {
  return chat.pinnedAt?.[userId] !== undefined;
};

// Get the timestamp when user pinned the chat
export const getPinnedAt = (chat: Chat, userId: string): number | undefined => {
  return chat.pinnedAt?.[userId];
};

// Check if chat is muted by user
export const isMuted = (chat: Chat, userId: string): boolean => {
  return chat.mutedBy?.includes(userId) || false;
};

// Favorite a chat for a user
export const favoriteChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    favouritedBy: arrayUnion(userId),
  });
};

// Unfavorite a chat for a user
export const unfavoriteChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const { arrayRemove } = await import("firebase/firestore");
  await updateDoc(chatRef, {
    favouritedBy: arrayRemove(userId),
  });
};

// Check if chat is favorited by user
export const isFavorited = (chat: Chat, userId: string): boolean => {
  return chat.favouritedBy?.includes(userId) || false;
};

// Rename a group chat
export const renameChat = async (chatId: string, newName: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    groupName: newName,
  });
};

// Leave a chat (for groups)
export const leaveChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const { arrayRemove } = await import("firebase/firestore");
  await updateDoc(chatRef, {
    participants: arrayRemove(userId),
    groupAdminIds: arrayRemove(userId),
  });
};

// Delete a chat (for private chats)
export const deleteChat = async (chatId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(chatRef);
};

// Edit a message
export const editMessage = async (
  chatId: string,
  messageId: string,
  newText: string
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, {
    text: newText,
    editedAt: serverTimestamp(),
  });
};

// Delete a message (soft delete)
export const deleteMessage = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, {
    deleted: true,
    text: "This message was deleted",
  });
};

// Add reaction to a message
export const addReaction = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (!messageDoc.exists()) return;
  
  const data = messageDoc.data();
  const reactions = data.reactions || {};
  
  // Remove user from other reactions for this message (one reaction per user)
  Object.keys(reactions).forEach((key) => {
    reactions[key] = reactions[key].filter((id: string) => id !== userId);
    if (reactions[key].length === 0) delete reactions[key];
  });
  
  // Add new reaction
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }
  reactions[emoji].push(userId);
  
  await updateDoc(messageRef, { reactions });
};

// Remove reaction from a message
export const removeReaction = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (!messageDoc.exists()) return;
  
  const data = messageDoc.data();
  const reactions = data.reactions || {};
  
  if (reactions[emoji]) {
    reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  }
  
  await updateDoc(messageRef, { reactions });
};

// Forward a message to another chat
export const forwardMessage = async (
  sourceChatId: string,
  sourceMessageId: string,
  destinationChatId: string,
  senderId: string
): Promise<void> => {
  // Get original message
  const sourceMessageRef = doc(db, "chats", sourceChatId, "messages", sourceMessageId);
  const sourceMessageDoc = await getDoc(sourceMessageRef);
  
  if (!sourceMessageDoc.exists()) return;
  
  const originalMessage = sourceMessageDoc.data();
  
  // Create forwarded message in destination chat
  const destMessagesRef = collection(db, "chats", destinationChatId, "messages");
  const destChatRef = doc(db, "chats", destinationChatId);
  
  await addDoc(destMessagesRef, {
    text: originalMessage.text,
    senderId,
    createdAt: serverTimestamp(),
    readBy: [senderId],
    forwardedFrom: {
      chatId: sourceChatId,
      messageId: sourceMessageId,
    },
  });
  
  // Update last message in destination chat
  await updateDoc(destChatRef, {
    lastMessage: originalMessage.text,
    lastMessageAt: serverTimestamp(),
  });
};

// Get a single message by ID
export const getMessageById = async (
  chatId: string,
  messageId: string
): Promise<Message | null> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (!messageDoc.exists()) return null;
  
  return {
    id: messageDoc.id,
    ...messageDoc.data(),
  } as Message;
};

// Send a call notification message to a chat
export const sendCallMessage = async (
  chatId: string,
  callerId: string,
  callType: "voice" | "video",
  status: "missed" | "declined" | "ended",
  duration?: number
): Promise<void> => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);
  
  // Generate display text based on status
  let displayText = "";
  const callTypeLabel = callType === "voice" ? "Voice call" : "Video call";
  
  switch (status) {
    case "missed":
      displayText = `📞 Missed ${callTypeLabel.toLowerCase()}`;
      break;
    case "declined":
      displayText = `📞 ${callTypeLabel} declined`;
      break;
    case "ended":
      if (duration && duration > 0) {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationStr = minutes > 0 
          ? `${minutes}:${seconds.toString().padStart(2, "0")}` 
          : `${seconds}s`;
        displayText = `📞 ${callTypeLabel} • ${durationStr}`;
      } else {
        displayText = `📞 ${callTypeLabel} ended`;
      }
      break;
  }
  
  // Add call notification message
  await addDoc(messagesRef, {
    text: displayText,
    senderId: callerId,
    createdAt: serverTimestamp(),
    readBy: [callerId],
    callData: {
      type: callType,
      status,
      duration,
      callerId,
    },
  });
  
  // Update last message in chat
  await updateDoc(chatRef, {
    lastMessage: displayText,
    lastMessageAt: serverTimestamp(),
  });
};

// Leave a group chat with validation and system message
export const leaveGroupChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);
  
  if (!chatDoc.exists()) {
    throw new Error("Chat not found");
  }
  
  const chatData = chatDoc.data();
  
  // Only allow leaving group chats
  if (chatData.type !== "group") {
    throw new Error("Cannot leave a private chat");
  }
  
  // Don't allow creator to leave if they're the only admin
  const admins = chatData.groupAdminIds || [];
  if (chatData.groupCreatorId === userId && admins.length === 1 && admins[0] === userId) {
    throw new Error("Creator must assign another admin before leaving");
  }
  
  const batch = writeBatch(db);
  
  // Remove user from participants
  const updatedParticipants = chatData.participants.filter((p: string) => p !== userId);
  
  // Remove user from admins if they are one
  const updatedAdmins = admins.filter((a: string) => a !== userId);
  
  batch.update(chatRef, {
    participants: updatedParticipants,
    groupAdminIds: updatedAdmins,
  });
  
  // Add system message about user leaving
  const messagesRef = collection(db, "chats", chatId, "messages");
  batch.set(doc(messagesRef), {
    text: "left the group",
    senderId: userId,
    createdAt: serverTimestamp(),
    readBy: [userId],
    type: "system",
  });
  
  await batch.commit();
};

// Add participants to a group chat
export const addParticipantsToGroup = async (
  chatId: string,
  userIds: string[],
  addedByUserId: string
): Promise<void> => {
  if (userIds.length === 0) {
    throw new Error("No users selected");
  }

  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    throw new Error("Chat not found");
  }

  const chatData = chatDoc.data();

  // Only allow for group chats
  if (chatData.type !== "group") {
    throw new Error("Can only add participants to group chats");
  }

  // Filter out users who are already participants
  const currentParticipants = chatData.participants || [];
  const newParticipants = userIds.filter(
    (userId) => !currentParticipants.includes(userId)
  );

  if (newParticipants.length === 0) {
    throw new Error("All selected users are already participants");
  }

  const batch = writeBatch(db);

  // Add new participants to the group
  batch.update(chatRef, {
    participants: [...currentParticipants, ...newParticipants],
  });

  // Add system message for each added participant
  const messagesRef = collection(db, "chats", chatId, "messages");
  newParticipants.forEach((userId) => {
    batch.set(doc(messagesRef), {
      text: "was added to the group",
      senderId: userId,
      createdAt: serverTimestamp(),
      readBy: [addedByUserId],
      type: "system",
    });
  });

  await batch.commit();
};
