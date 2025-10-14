import crypto from 'crypto';

/**
 * Production-grade preview token signing
 * Uses HMAC-SHA256 to create tamper-proof preview links
 */

interface PreviewPayload {
  id: string;
  exp: number; // Unix timestamp
}

const PREVIEW_SECRET = process.env.PREVIEW_SECRET || process.env.REVALIDATE_SECRET || 'dev-preview-secret';

/**
 * Sign a preview payload
 * @param payload - Post ID and expiration timestamp
 * @returns Base64-encoded signed token
 */
export function signPreview(payload: PreviewPayload): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', PREVIEW_SECRET);
  hmac.update(data);
  const signature = hmac.digest('base64url');
  
  // Format: base64(payload).signature
  const token = `${Buffer.from(data).toString('base64url')}.${signature}`;
  return token;
}

/**
 * Verify and decode a preview token
 * @param token - Signed token from preview link
 * @returns Payload if valid, null if invalid or expired
 */
export function verifyPreview(token: string): PreviewPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    
    if (!payloadB64 || !signature) {
      console.warn('Invalid preview token format');
      return null;
    }
    
    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: PreviewPayload = JSON.parse(payloadJson);
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', PREVIEW_SECRET);
    hmac.update(payloadJson);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) {
      console.warn('Invalid preview token signature');
      return null;
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.warn('Preview token expired');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Error verifying preview token:', error);
    return null;
  }
}

/**
 * Generate a preview URL with signed token
 * @param postId - Post ID to preview
 * @param siteUrl - Base URL of the site
 * @param ttlMinutes - Token validity in minutes (default 60)
 * @returns Complete preview URL
 */
export function generatePreviewUrl(postId: string, siteUrl: string, ttlMinutes: number = 60): string {
  const exp = Math.floor(Date.now() / 1000) + (ttlMinutes * 60);
  const token = signPreview({ id: postId, exp });
  return `${siteUrl}/api/preview?token=${encodeURIComponent(token)}`;
}

