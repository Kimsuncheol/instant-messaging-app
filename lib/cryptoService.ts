/**
 * E2EE Crypto Service
 * Uses Web Crypto API for all cryptographic operations
 * RSA-OAEP for key exchange, AES-GCM for message encryption
 */

// ============ Types ============

export interface EncryptedPayload {
  encryptedContent: string;  // Base64 AES-GCM ciphertext
  encryptedKey: string;      // Base64 RSA-OAEP encrypted AES key
  iv: string;                // Base64 initialization vector
  signature: string;         // Base64 sender signature
  senderId: string;
}

export interface KeyPairJwk {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

// ============ Constants ============

const RSA_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const AES_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

const SIGNATURE_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-PSS",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

// ============ Helpers ============

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// ============ Key Generation ============

/**
 * Generate RSA-OAEP key pair for encryption/decryption
 */
export const generateEncryptionKeyPair = async (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(RSA_ALGORITHM, true, ["encrypt", "decrypt"]);
};

/**
 * Generate RSA-PSS key pair for signing/verification
 */
export const generateSigningKeyPair = async (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(SIGNATURE_ALGORITHM, true, ["sign", "verify"]);
};

/**
 * Generate AES-GCM symmetric key for message encryption
 */
export const generateSymmetricKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.generateKey(AES_ALGORITHM, true, ["encrypt", "decrypt"]);
};

// ============ Key Export/Import ============

/**
 * Export a public key to JWK format for storage
 */
export const exportPublicKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return crypto.subtle.exportKey("jwk", key);
};

/**
 * Export a private key to JWK format for local storage
 */
export const exportPrivateKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return crypto.subtle.exportKey("jwk", key);
};

/**
 * Import a public key from JWK for encryption
 */
export const importEncryptionPublicKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return crypto.subtle.importKey("jwk", jwk, RSA_ALGORITHM, true, ["encrypt"]);
};

/**
 * Import a private key from JWK for decryption
 */
export const importEncryptionPrivateKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return crypto.subtle.importKey("jwk", jwk, RSA_ALGORITHM, true, ["decrypt"]);
};

/**
 * Import a public key from JWK for signature verification
 */
export const importSigningPublicKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return crypto.subtle.importKey("jwk", jwk, SIGNATURE_ALGORITHM, true, ["verify"]);
};

/**
 * Import a private key from JWK for signing
 */
export const importSigningPrivateKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return crypto.subtle.importKey("jwk", jwk, SIGNATURE_ALGORITHM, true, ["sign"]);
};

// ============ Encryption/Decryption ============

/**
 * Encrypt a message for a recipient
 * 1. Generate random AES key
 * 2. Encrypt content with AES key
 * 3. Encrypt AES key with recipient's RSA public key
 */
export const encryptMessage = async (
  content: string,
  recipientPublicKey: CryptoKey,
  senderSigningPrivateKey: CryptoKey,
  senderId: string
): Promise<EncryptedPayload> => {
  // Generate random symmetric key
  const symmetricKey = await generateSymmetricKey();

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt content with AES-GCM
  const encoder = new TextEncoder();
  const contentBuffer = encoder.encode(content);
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    contentBuffer
  );

  // Export and encrypt the symmetric key with recipient's public key
  const rawSymmetricKey = await crypto.subtle.exportKey("raw", symmetricKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    rawSymmetricKey
  );

  // Sign the content
  const signature = await signMessage(content, senderSigningPrivateKey);

  return {
    encryptedContent: arrayBufferToBase64(encryptedContent),
    encryptedKey: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv),
    signature: arrayBufferToBase64(signature),
    senderId,
  };
};

/**
 * Decrypt a message using recipient's private key
 */
export const decryptMessage = async (
  payload: EncryptedPayload,
  recipientPrivateKey: CryptoKey
): Promise<string> => {
  // Decrypt the symmetric key
  const encryptedKeyBuffer = base64ToArrayBuffer(payload.encryptedKey);
  const rawSymmetricKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    recipientPrivateKey,
    encryptedKeyBuffer
  );

  // Import the symmetric key
  const symmetricKey = await crypto.subtle.importKey(
    "raw",
    rawSymmetricKey,
    AES_ALGORITHM,
    false,
    ["decrypt"]
  );

  // Decrypt the content
  const iv = base64ToArrayBuffer(payload.iv);
  const encryptedContentBuffer = base64ToArrayBuffer(payload.encryptedContent);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    encryptedContentBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

// ============ Signing/Verification ============

/**
 * Sign a message with sender's private key
 */
export const signMessage = async (
  content: string,
  privateKey: CryptoKey
): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    data
  );
};

/**
 * Verify a message signature
 */
export const verifySignature = async (
  content: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    signature,
    data
  );
};

/**
 * Verify an encrypted payload's signature
 */
export const verifyPayloadSignature = async (
  decryptedContent: string,
  payload: EncryptedPayload,
  senderSigningPublicKey: CryptoKey
): Promise<boolean> => {
  const signatureBuffer = base64ToArrayBuffer(payload.signature);
  return verifySignature(decryptedContent, signatureBuffer, senderSigningPublicKey);
};
