/**
 * LinkedIn API Client
 * Handles OAuth flow and API requests
 */

import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';

// LinkedIn OAuth endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface LinkedInTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

/**
 * Get LinkedIn OAuth configuration from environment
 */
export function getLinkedInConfig(): LinkedInConfig {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const scopes = (process.env.LINKEDIN_SCOPES || 'w_member_social').split(',');

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing LinkedIn OAuth config. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes,
  };
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const config = getLinkedInConfig();
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<LinkedInTokens> {
  const config = getLinkedInConfig();

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  const data = await response.json();

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    expiresAt,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<LinkedInTokens> {
  const config = getLinkedInConfig();

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token refresh failed: ${error}`);
  }

  const data = await response.json();

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Reuse old if not provided
    expiresIn: data.expires_in,
    expiresAt,
  };
}

/**
 * Get LinkedIn user profile
 */
export async function getProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch(`${LINKEDIN_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch LinkedIn profile: ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    firstName: data.localizedFirstName || data.firstName?.localized?.en_US || '',
    lastName: data.localizedLastName || data.lastName?.localized?.en_US || '',
    profilePicture: data.profilePicture?.displayImage || undefined,
  };
}

/**
 * Store LinkedIn account tokens in database (encrypted)
 */
export async function storeSocialAccount(
  userId: string,
  tokens: LinkedInTokens,
  profile: LinkedInProfile
) {
  const encryptedAccessToken = encrypt(tokens.accessToken);
  const encryptedRefreshToken = tokens.refreshToken
    ? encrypt(tokens.refreshToken)
    : null;

  // Delete existing LinkedIn account for this user (only one per user)
  await prisma.socialAccount.deleteMany({
    where: {
      userId,
      provider: 'linkedin',
    },
  });

  // Create new account record
  return await prisma.socialAccount.create({
    data: {
      userId,
      provider: 'linkedin',
      accountId: profile.id,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: tokens.expiresAt,
      scopes: (process.env.LINKEDIN_SCOPES || 'w_member_social').split(','),
      metadata: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        profilePicture: profile.profilePicture,
      },
    },
  });
}

/**
 * Get LinkedIn account for a user (with decrypted tokens)
 */
export async function getLinkedInAccount(userId: string) {
  const account = await prisma.socialAccount.findFirst({
    where: {
      userId,
      provider: 'linkedin',
    },
  });

  if (!account) {
    return null;
  }

  // Check if token is expired
  const isExpired = new Date() >= account.tokenExpiresAt;

  // If expired and we have refresh token, try to refresh
  if (isExpired && account.refreshToken) {
    try {
      const decryptedRefreshToken = decrypt(account.refreshToken);
      const newTokens = await refreshAccessToken(decryptedRefreshToken);

      // Update account with new tokens
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(newTokens.accessToken),
          refreshToken: newTokens.refreshToken
            ? encrypt(newTokens.refreshToken)
            : account.refreshToken,
          tokenExpiresAt: newTokens.expiresAt,
        },
      });

      return {
        ...account,
        accessToken: newTokens.accessToken, // Return decrypted
        isExpired: false,
      };
    } catch (error) {
      console.error('Failed to refresh LinkedIn token:', error);
      // Return expired account so user can reconnect
      return {
        ...account,
        accessToken: decrypt(account.accessToken),
        isExpired: true,
      };
    }
  }

  return {
    ...account,
    accessToken: decrypt(account.accessToken),
    isExpired,
  };
}

/**
 * Revoke LinkedIn account connection
 */
export async function revokeLinkedInAccount(userId: string) {
  return await prisma.socialAccount.deleteMany({
    where: {
      userId,
      provider: 'linkedin',
    },
  });
}

/**
 * Test LinkedIn API connection
 */
export async function testConnection(accessToken: string): Promise<boolean> {
  try {
    await getProfile(accessToken);
    return true;
  } catch (error) {
    return false;
  }
}

