/**
 * LinkedIn Post API
 * POST /api/linkedin/post - Post content to LinkedIn immediately
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { postToLinkedIn } from '@/lib/linkedin/posting';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PostRequest {
  contentId?: string; // Optional: link to content_library
  text: string;
  url?: string;
  imageUrl?: string;
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: PostRequest = await request.json();

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post text is required' },
        { status: 400 }
      );
    }

    // Validate text length (LinkedIn limit: 3000 characters)
    if (body.text.length > 3000) {
      return NextResponse.json(
        { error: 'Post text exceeds LinkedIn limit of 3000 characters' },
        { status: 400 }
      );
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(user.id, {
      text: body.text,
      url: body.url,
      imageUrl: body.imageUrl,
      images: body.images,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to post to LinkedIn',
          details: result.error 
        },
        { status: 500 }
      );
    }

    // If contentId provided, update the content_library record
    if (body.contentId) {
      try {
        const existingContent = await prisma.contentLibrary.findUnique({
          where: { id: body.contentId },
          select: { publishedLinks: true },
        });

        const publishedLinks = existingContent?.publishedLinks as Record<string, string> || {};
        publishedLinks.linkedin = result.permalink || '';

        await prisma.contentLibrary.update({
          where: { id: body.contentId },
          data: {
            publishStatus: 'posted',
            publishedLinks,
            publishAttempts: {
              increment: 1,
            },
            lastPublishAttempt: new Date(),
            lastPublishError: null,
          },
        });
      } catch (dbError) {
        console.error('Failed to update content_library:', dbError);
        // Don't fail the request, post was successful
      }
    }

    // Log the successful post (optional: can add to a posts table)
    console.log('LinkedIn post successful:', {
      userId: user.id,
      postId: result.postId,
      permalink: result.permalink,
      contentId: body.contentId,
    });

    return NextResponse.json({
      success: true,
      postId: result.postId,
      permalink: result.permalink,
      message: 'Posted to LinkedIn successfully',
    });

  } catch (error) {
    console.error('LinkedIn post API error:', error);

    // If contentId provided, log the error
    const body = await request.json().catch(() => ({}));
    if (body.contentId) {
      try {
        await prisma.contentLibrary.update({
          where: { id: body.contentId },
          data: {
            publishStatus: 'failed',
            publishAttempts: {
              increment: 1,
            },
            lastPublishAttempt: new Date(),
            lastPublishError: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (dbError) {
        console.error('Failed to update content_library with error:', dbError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to post to LinkedIn',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

