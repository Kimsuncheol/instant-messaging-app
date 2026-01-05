/**
 * Encrypted Message Service
 * Handles E2EE message sending and receiving
 */

import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  encryptMessage,
  decryptMessage,
  verifyPayloadSignature,
  EncryptedPayload,
} from "./cryptoService";
import {
  getPrivateKeys,
  getPublicKeysFromFirestore,
} from "./keyStorageService";

// ============ Types ============

export interface EncryptedMessage {
  id: string;
  chatId: string;
  senderId: string;
  timestamp: ReturnType<typeof serverTimestamp>;
  type: "encrypted";
  encrypted: EncryptedPayload;
  readBy: string[];
}

// ============ Encrypted Message CRUD ============

/**
 * Send an encrypted message to a chat
 */
export const sendEncryptedMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  plaintext: string
): Promise<string> => {
  // Get sender's private keys for signing
  const senderKeys = await getPrivateKeys(senderId);
  if (!senderKeys) {
    throw new Error("Sender private keys not found. Please regenerate keys.");
  }

  // Get recipient's public keys for encryption
  const recipientKeys = await getPublicKeysFromFirestore(recipientId);
  if (!recipientKeys) {
    throw new Error("Recipient public keys not found. Cannot send encrypted message.");
  }

  // Encrypt the message
  const encryptedPayload = await encryptMessage(
    plaintext,
    recipientKeys.encryptionKey,
    senderKeys.signingKey,
    senderId
  );

  // Create message document
  const messagesRef = collection(db, "chats", chatId, "messages");
  const messageData: Omit<EncryptedMessage, "id"> = {
    chatId,
    senderId,
    timestamp: serverTimestamp(),
    type: "encrypted",
    encrypted: encryptedPayload,
    readBy: [senderId],
  };

  const docRef = await addDoc(messagesRef, {
    ...messageData,
    id: uuidv4(),
  });

  // Update chat's lastMessage preview (encrypted indicator)
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: "🔒 Encrypted message",
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId,
  });

  return docRef.id;
};

/**
 * Decrypt a received message
 */
export const decryptReceivedMessage = async (
  encryptedPayload: EncryptedPayload,
  recipientId: string
): Promise<{ content: string; verified: boolean }> => {
  // Get recipient's private keys for decryption
  const recipientKeys = await getPrivateKeys(recipientId);
  if (!recipientKeys) {
    throw new Error("Private keys not found. Cannot decrypt message.");
  }

  // Decrypt the message
  const plaintext = await decryptMessage(encryptedPayload, recipientKeys.encryptionKey);

  // Get sender's public key for signature verification
  const senderKeys = await getPublicKeysFromFirestore(encryptedPayload.senderId);
  let verified = false;

  if (senderKeys) {
    try {
      verified = await verifyPayloadSignature(
        plaintext,
        encryptedPayload,
        senderKeys.signingKey
      );
    } catch (error) {
      console.warn("Signature verification failed:", error);
    }
  }

  return { content: plaintext, verified };
};

/**
 * Check if a message is encrypted
 */
export const isEncryptedMessage = (message: { type?: string; encrypted?: unknown }): boolean => {
  return message.type === "encrypted" && !!message.encrypted;
};

/**
 * Get decrypted content for display
 * Caches decrypted content in memory
 */
const decryptionCache = new Map<string, { content: string; verified: boolean }>();

export const getDecryptedContent = async (
  messageId: string,
  encryptedPayload: EncryptedPayload,
  recipientId: string
): Promise<{ content: string; verified: boolean }> => {
  // Check cache first
  const cached = decryptionCache.get(messageId);
  if (cached) {
    return cached;
  }

  // Decrypt and cache
  const result = await decryptReceivedMessage(encryptedPayload, recipientId);
  decryptionCache.set(messageId, result);
  return result;
};

/**
 * Clear decryption cache (call on logout)
 */
export const clearDecryptionCache = (): void => {
  decryptionCache.clear();
};

// ============ Group Chat Support ============

/**
 * Send encrypted message to multiple recipients (group chat)
 * Each recipient gets their own encrypted copy of the symmetric key
 */
export const sendGroupEncryptedMessage = async (
  chatId: string,
  senderId: string,
  recipientIds: string[],
  plaintext: string
): Promise<string> => {
  const senderKeys = await getPrivateKeys(senderId);
  if (!senderKeys) {
    throw new Error("Sender private keys not found.");
  }

  // Encrypt for each recipient
  const encryptedPayloads: Record<string, EncryptedPayload> = {};

  for (const recipientId of recipientIds) {
    const recipientKeys = await getPublicKeysFromFirestore(recipientId);
    if (recipientKeys) {
      encryptedPayloads[recipientId] = await encryptMessage(
        plaintext,
        recipientKeys.encryptionKey,
        senderKeys.signingKey,
        senderId
      );
    }
  }

  // Create message with multiple encrypted payloads
  const messagesRef = collection(db, "chats", chatId, "messages");
  const docRef = await addDoc(messagesRef, {
    id: uuidv4(),
    chatId,
    senderId,
    timestamp: serverTimestamp(),
    type: "group_encrypted",
    encryptedPayloads,
    readBy: [senderId],
  });

  // Update chat preview
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: "🔒 Encrypted message",
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId,
  });

  return docRef.id;
};
