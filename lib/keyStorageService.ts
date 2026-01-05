/**
 * Key Storage Service
 * Stores private keys in IndexedDB, public keys in Firestore
 * Never sends private keys to the server
 */

import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  exportPublicKey,
  exportPrivateKey,
  importEncryptionPrivateKey,
  importEncryptionPublicKey,
  importSigningPrivateKey,
  importSigningPublicKey,
  generateEncryptionKeyPair,
  generateSigningKeyPair,
} from "./cryptoService";

// ============ Types ============

export interface UserKeys {
  encryptionPublicKey: JsonWebKey;
  signingPublicKey: JsonWebKey;
}

interface StoredPrivateKeys {
  encryptionPrivateKey: JsonWebKey;
  signingPrivateKey: JsonWebKey;
}

// ============ IndexedDB Constants ============

const DB_NAME = "e2ee_keys";
const DB_VERSION = 1;
const STORE_NAME = "private_keys";

// ============ IndexedDB Helpers ============

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "userId" });
      }
    };
  });
};

// ============ Private Key Storage (IndexedDB) ============

/**
 * Store private keys locally in IndexedDB
 */
export const storePrivateKeys = async (
  userId: string,
  encryptionPrivateKey: CryptoKey,
  signingPrivateKey: CryptoKey
): Promise<void> => {
  const db = await openDatabase();

  const encryptionJwk = await exportPrivateKey(encryptionPrivateKey);
  const signingJwk = await exportPrivateKey(signingPrivateKey);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const data: StoredPrivateKeys & { userId: string } = {
      userId,
      encryptionPrivateKey: encryptionJwk,
      signingPrivateKey: signingJwk,
    };

    const request = store.put(data);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Retrieve private keys from IndexedDB
 */
export const getPrivateKeys = async (
  userId: string
): Promise<{ encryptionKey: CryptoKey; signingKey: CryptoKey } | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = async () => {
      const data = request.result as (StoredPrivateKeys & { userId: string }) | undefined;
      if (!data) {
        resolve(null);
        return;
      }

      try {
        const encryptionKey = await importEncryptionPrivateKey(data.encryptionPrivateKey);
        const signingKey = await importSigningPrivateKey(data.signingPrivateKey);
        resolve({ encryptionKey, signingKey });
      } catch (error) {
        reject(error);
      }
    };
  });
};

/**
 * Delete private keys from IndexedDB
 */
export const deletePrivateKeys = async (userId: string): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ============ Public Key Storage (Firestore) ============

/**
 * Save public keys to user's Firestore document
 */
export const savePublicKeysToFirestore = async (
  userId: string,
  encryptionPublicKey: CryptoKey,
  signingPublicKey: CryptoKey
): Promise<void> => {
  const encryptionJwk = await exportPublicKey(encryptionPublicKey);
  const signingJwk = await exportPublicKey(signingPublicKey);

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    encryptionPublicKey: encryptionJwk,
    signingPublicKey: signingJwk,
    keysGeneratedAt: new Date().toISOString(),
  });
};

/**
 * Get public keys from a user's Firestore document
 */
export const getPublicKeysFromFirestore = async (
  userId: string
): Promise<{ encryptionKey: CryptoKey; signingKey: CryptoKey } | null> => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  if (!data?.encryptionPublicKey || !data?.signingPublicKey) {
    return null;
  }

  const encryptionKey = await importEncryptionPublicKey(data.encryptionPublicKey);
  const signingKey = await importSigningPublicKey(data.signingPublicKey);

  return { encryptionKey, signingKey };
};

// ============ Key Generation & Storage ============

/**
 * Generate and store new key pairs for a user
 * Call this on user registration or key rotation
 */
export const generateAndStoreUserKeys = async (userId: string): Promise<void> => {
  // Generate key pairs
  const encryptionKeyPair = await generateEncryptionKeyPair();
  const signingKeyPair = await generateSigningKeyPair();

  // Store private keys locally
  await storePrivateKeys(
    userId,
    encryptionKeyPair.privateKey,
    signingKeyPair.privateKey
  );

  // Store public keys in Firestore
  await savePublicKeysToFirestore(
    userId,
    encryptionKeyPair.publicKey,
    signingKeyPair.publicKey
  );
};

/**
 * Check if user has keys, generate if not
 */
export const ensureUserHasKeys = async (userId: string): Promise<boolean> => {
  const localKeys = await getPrivateKeys(userId);
  
  if (localKeys) {
    return true; // Keys exist
  }

  // Check if public keys exist in Firestore (keys may exist on another device)
  const remoteKeys = await getPublicKeysFromFirestore(userId);
  
  if (remoteKeys) {
    // Public keys exist but no local private keys
    // User needs to regenerate keys (losing access to old messages)
    console.warn("Public keys exist but no local private keys. Key regeneration needed.");
    return false;
  }

  // No keys anywhere, generate new ones
  await generateAndStoreUserKeys(userId);
  return true;
};
