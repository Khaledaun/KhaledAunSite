import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn } from '@/lib/linkedin/posting';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/workflow/publish-linkedin
 * Publish approved LinkedIn posts to LinkedIn and website
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { topicId, language = 'en' } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    // Get topic
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const metadata = topic.metadata as any;

    if (topic.status !== 'linkedin_approved' && topic.status !== 'linkedin_ready') {
      return NextResponse.json(
        { error: 'LinkedIn post must be approved before publishing' },
        { status: 400 }
      );
    }

    if (!metadata?.linkedinEn || !metadata?.linkedinAr) {
      return NextResponse.json(
        { error: 'LinkedIn posts not generated yet' },
        { status: 400 }
      );
    }

    console.log(`Publishing LinkedIn post for topic: ${topic.title} (${language})`);

    const linkedinText = language === 'en' ? metadata.linkedinEn : metadata.linkedinAr;
    const articleUrl = language === 'en' ? metadata.enUrl : metadata.arUrl;

    try {
      // Get user from auth
      const user = auth.user;
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Post to LinkedIn
      const linkedinResult = await postToLinkedIn(user.id, {
        text: linkedinText,
        url: articleUrl,
      });

      if (!linkedinResult.success) {
        throw new Error(linkedinResult.error || 'Failed to post to LinkedIn');
      }

      // Save to website's LinkedIn section (content library)
      const linkedinPost = await prisma.contentLibrary.create({
        data: {
          topicId,
          type: 'social_post',
          format: 'linkedin',
          title: topic.title,
          content: linkedinText,
          publishStatus: 'published',
          publishedAt: new Date(),
          metadata: {
            language,
            linkedinUrl: linkedinResult.permalink,
            articleUrl,
            postedAt: new Date().toISOString(),
          },
        },
      });

      // Update topic metadata
      const updateKey = language === 'en' ? 'linkedinEnPosted' : 'linkedinArPosted';
      await prisma.topic.update({
        where: { id: topicId },
        data: {
          status: 'linkedin_published',
          metadata: {
            ...metadata,
            [updateKey]: true,
            linkedinPostId: linkedinPost.id,
            linkedinUrl: linkedinResult.permalink,
            linkedinPublishedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`✅ LinkedIn post published: ${linkedinResult.permalink}`);

      return NextResponse.json({
        success: true,
        linkedinUrl: linkedinResult.permalink,
        postId: linkedinPost.id,
      });
    } catch (publishError) {
      console.error('LinkedIn publishing error:', publishError);

      // If LinkedIn posting fails, still save to website
      const linkedinPost = await prisma.contentLibrary.create({
        data: {
          topicId,
          type: 'social_post',
          format: 'linkedin',
          title: topic.title,
          content: linkedinText,
          publishStatus: 'published',
          publishedAt: new Date(),
          metadata: {
            language,
            articleUrl,
            postedAt: new Date().toISOString(),
            linkedinError: publishError instanceof Error ? publishError.message : 'Unknown error',
          },
        },
      });

      return NextResponse.json({
        success: true,
        warning: 'Saved to website but LinkedIn posting failed. You may need to post manually.',
        postId: linkedinPost.id,
        error: publishError instanceof Error ? publishError.message : undefined,
      });
    }
  } catch (error) {
    console.error('Error publishing LinkedIn post:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to publish LinkedIn post',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
