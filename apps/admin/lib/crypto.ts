/**
 * Encryption utilities for secure token storage
 * Uses AES-256-GCM for encrypting OAuth tokens at rest
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment or generate a warning
 */
function getEncryptionKey(): Buffer {
  const key = process.env.LINKEDIN_ENCRYPTION_KEY;
  
  if (!key) {
    console.warn(
      '⚠️  LINKEDIN_ENCRYPTION_KEY not set! Using development key. ' +
      'NEVER use this in production!'
    );
    // Development fallback (DO NOT use in production)
    return Buffer.from('dev-key-32-bytes-long-for-aes!'.padEnd(32, '0'));
  }

  // Support both hex and base64 encoded keys
  if (key.length === 64) {
    // Hex encoded 32-byte key
    return Buffer.from(key, 'hex');
  } else if (key.length === 44 || key.length === 43) {
    // Base64 encoded 32-byte key
    return Buffer.from(key, 'base64');
  } else if (key.length >= 32) {
    // Raw string, take first 32 bytes
    return Buffer.from(key.slice(0, 32), 'utf-8');
  } else {
    throw new Error(
      'LINKEDIN_ENCRYPTION_KEY must be 32 bytes (64 hex chars or 44 base64 chars)'
    );
  }
}

/**
 * Encrypt a string value (e.g., access token)
 * Returns base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted (all hex)
  const combined = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  
  // Return as base64 for database storage
  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt an encrypted value
 * Expects base64-encoded data from encrypt()
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  
  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
  
  // Split into components
  const parts = combined.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a secure random string for CSRF tokens, state params, etc.
 */
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash a value for comparison (e.g., state parameter validation)
 */
export function hashValue(value: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate encryption key for initial setup
 * Run this once to generate LINKEDIN_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  const key = randomBytes(32);
  console.log('\n🔑 Generated encryption key (save to .env):');
  console.log('LINKEDIN_ENCRYPTION_KEY=' + key.toString('hex'));
  console.log('\nOr as base64:');
  console.log('LINKEDIN_ENCRYPTION_KEY=' + key.toString('base64'));
  return key.toString('hex');
}

// For testing in development
if (require.main === module) {
  console.log('🔐 Crypto Module Test\n');
  
  // Generate a key
  generateEncryptionKey();
  
  // Test encryption/decryption
  const testToken = 'test-access-token-12345';
  console.log('\n✅ Testing encryption...');
  console.log('Original:', testToken);
  
  const encrypted = encrypt(testToken);
  console.log('Encrypted:', encrypted);
  
  const decrypted = decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  
  console.log('\nMatch:', testToken === decrypted ? '✅ YES' : '❌ NO');
}

