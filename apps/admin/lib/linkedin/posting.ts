/**
 * LinkedIn Posting API
 * Handles posting content to LinkedIn (text, images, links)
 */

import { getLinkedInAccount } from './client';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInPost {
  text: string;
  url?: string;
  imageUrl?: string;
  images?: string[]; // For carousel
}

export interface PostResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

/**
 * Post text-only update to LinkedIn
 */
async function postTextUpdate(
  accessToken: string,
  authorUrn: string,
  text: string
): Promise<any> {
  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  return response.json();
}

/**
 * Post update with link to LinkedIn
 */
async function postLinkUpdate(
  accessToken: string,
  authorUrn: string,
  text: string,
  url: string
): Promise<any> {
  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: url,
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  return response.json();
}

/**
 * Upload image to LinkedIn and get URN
 */
async function uploadImage(
  accessToken: string,
  authorUrn: string,
  imageUrl: string
): Promise<string> {
  // Step 1: Register upload
  const registerResponse = await fetch(
    `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  );

  if (!registerResponse.ok) {
    const error = await registerResponse.text();
    throw new Error(`Image upload registration failed: ${error}`);
  }

  const registerData = await registerResponse.json();
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const asset = registerData.value.asset;

  // Step 2: Download image from our storage
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Failed to fetch image from URL');
  }
  const imageBuffer = await imageResponse.arrayBuffer();

  // Step 3: Upload to LinkedIn
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: imageBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Image upload failed: ${error}`);
  }

  return asset;
}

/**
 * Post update with image to LinkedIn
 */
async function postImageUpdate(
  accessToken: string,
  authorUrn: string,
  text: string,
  imageUrl: string
): Promise<any> {
  // Upload image first
  const assetUrn = await uploadImage(accessToken, authorUrn, imageUrl);

  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              media: assetUrn,
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  return response.json();
}

/**
 * Post update with multiple images (carousel) to LinkedIn
 */
async function postCarouselUpdate(
  accessToken: string,
  authorUrn: string,
  text: string,
  imageUrls: string[]
): Promise<any> {
  // Upload all images
  const assetUrns = await Promise.all(
    imageUrls.map((url) => uploadImage(accessToken, authorUrn, url))
  );

  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'IMAGE',
          media: assetUrns.map((urn) => ({
            status: 'READY',
            media: urn,
          })),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  return response.json();
}

/**
 * Extract post ID and generate permalink from LinkedIn response
 */
function extractPostInfo(response: any): { postId: string; permalink: string } {
  const postId = response.id;
  
  // LinkedIn post URLs follow pattern: https://www.linkedin.com/feed/update/{urn}
  // The URN needs to be encoded
  const permalink = `https://www.linkedin.com/feed/update/${postId}`;
  
  return { postId, permalink };
}

/**
 * Main function to post to LinkedIn
 * Automatically chooses the right posting method based on content
 */
export async function postToLinkedIn(
  userId: string,
  post: LinkedInPost
): Promise<PostResult> {
  try {
    // Get LinkedIn account and token
    const account = await getLinkedInAccount(userId);

    if (!account) {
      return {
        success: false,
        error: 'No LinkedIn account connected. Please connect your account first.',
      };
    }

    if (account.isExpired) {
      return {
        success: false,
        error: 'LinkedIn access token expired. Please reconnect your account.',
      };
    }

    const accessToken = account.accessToken;
    const authorUrn = `urn:li:person:${account.accountId}`;

    let response: any;

    // Choose posting method based on content
    if (post.images && post.images.length > 1) {
      // Carousel post (multiple images)
      response = await postCarouselUpdate(
        accessToken,
        authorUrn,
        post.text,
        post.images
      );
    } else if (post.imageUrl) {
      // Single image post
      response = await postImageUpdate(
        accessToken,
        authorUrn,
        post.text,
        post.imageUrl
      );
    } else if (post.url) {
      // Link post
      response = await postLinkUpdate(accessToken, authorUrn, post.text, post.url);
    } else {
      // Text-only post
      response = await postTextUpdate(accessToken, authorUrn, post.text);
    }

    const { postId, permalink } = extractPostInfo(response);

    return {
      success: true,
      postId,
      permalink,
    };
  } catch (error) {
    console.error('LinkedIn posting error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get analytics for a LinkedIn post (basic)
 */
export async function getPostAnalytics(
  userId: string,
  postId: string
): Promise<any> {
  try {
    const account = await getLinkedInAccount(userId);

    if (!account || account.isExpired) {
      throw new Error('LinkedIn account not available or expired');
    }

    const response = await fetch(
      `${LINKEDIN_API_BASE}/socialActions/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch post analytics');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch LinkedIn analytics:', error);
    return null;
  }
}

