/**
 * Encryption utility for sensitive data like API keys
 * Uses AES-256-GCM encryption
 */

import crypto from 'crypto';

// Get encryption key from environment variable
// In production, this should be a 32-byte (256-bit) key stored securely
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-bytes-long-change-me!';

// Ensure the key is exactly 32 bytes
const getKey = (): Buffer => {
  const key = Buffer.from(ENCRYPTION_KEY);
  if (key.length !== 32) {
    // Hash the key to get exactly 32 bytes
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  }
  return key;
};

/**
 * Encrypt a string value using AES-256-GCM
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16); // Initialization vector
  const key = getKey();
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - The encrypted string (in format: iv:authTag:encryptedData)
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getKey();
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a string value (one-way, for verification)
 * @param value - The string to hash
 * @returns SHA-256 hash (hex-encoded)
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Verify a hashed value
 * @param value - The plaintext value
 * @param hashedValue - The hashed value to compare against
 * @returns true if they match
 */
export function verifyHash(value: string, hashedValue: string): boolean {
  return hash(value) === hashedValue;
}

