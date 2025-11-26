/**
 * Scheduled Publishing Automation
 * GET /api/scheduler/publish-scheduled
 *
 * Runs hourly via Vercel Cron to auto-publish scheduled content
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyGoogleIndexing } from '@khaledaun/utils/content-workflow';
import { generateBilingualLinkedInPosts } from '@khaledaun/utils/content-workflow';
import { postToLinkedIn } from '@/lib/linkedin/posting';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing multiple articles

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request for scheduled publishing');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting scheduled publishing check...');

    const now = new Date();
    const results = {
      published: 0,
      linkedinPosts: 0,
      errors: [] as { topicId: string; error: string }[],
    };

    // Find topics scheduled for publishing
    const scheduledTopics = await prisma.topic.findMany({
      where: {
        status: 'article_approved',
      },
    });

    // Filter topics with scheduledPublishDate in metadata
    const topicsToPublish = scheduledTopics.filter((topic) => {
      const metadata = topic.metadata as any;
      if (!metadata?.scheduledPublishDate) return false;

      const scheduledDate = new Date(metadata.scheduledPublishDate);
      return scheduledDate <= now;
    });

    console.log(`Found ${topicsToPublish.length} topics ready for scheduled publishing`);

    // Process each topic
    for (const topic of topicsToPublish) {
      try {
        const metadata = topic.metadata as any;

        console.log(`Publishing topic: ${topic.title}`);

        // Step 1: Publish articles
        const publishResult = await publishArticles(topic.id, metadata);
        results.published++;

        // Step 2: Auto-generate LinkedIn posts (if enabled)
        if (metadata.autoGenerateLinkedIn !== false) {
          await generateLinkedInForTopic(topic.id, metadata, publishResult);
        }

        // Step 3: Auto-post to LinkedIn (if enabled)
        if (metadata.autoPostLinkedIn === true) {
          try {
            const linkedinResult = await autoPostLinkedIn(topic.id, metadata, publishResult);
            if (linkedinResult.success) {
              results.linkedinPosts += linkedinResult.postsCreated;
            }
          } catch (linkedinError) {
            console.error(`LinkedIn posting failed for ${topic.id}:`, linkedinError);
            // Don't fail the whole process if LinkedIn fails
            results.errors.push({
              topicId: topic.id,
              error: `LinkedIn posting failed: ${linkedinError instanceof Error ? linkedinError.message : 'Unknown error'}`,
            });
          }
        }

        console.log(`✅ Successfully published: ${topic.title}`);
      } catch (error) {
        console.error(`Failed to publish topic ${topic.id}:`, error);
        results.errors.push({
          topicId: topic.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Mark topic for manual review
        await prisma.topic.update({
          where: { id: topic.id },
          data: {
            status: 'needs_review',
            metadata: {
              ...(topic.metadata as any),
              scheduledPublishError: error instanceof Error ? error.message : 'Unknown error',
              scheduledPublishAttemptedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `✅ Scheduled publishing complete: ${results.published} published, ${results.linkedinPosts} LinkedIn posts, ${results.errors.length} errors (${duration}ms)`
    );

    return NextResponse.json({
      success: true,
      published: results.published,
      linkedinPosts: results.linkedinPosts,
      errors: results.errors,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scheduled publishing failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Scheduled publishing failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Publish articles to website
 */
async function publishArticles(topicId: string, metadata: any) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) throw new Error('Topic not found');

  // Get articles from content library
  const [contentEn, contentAr] = await Promise.all([
    prisma.contentLibrary.findUnique({ where: { id: metadata.articleEnId } }),
    prisma.contentLibrary.findUnique({ where: { id: metadata.articleArId } }),
  ]);

  if (!contentEn || !contentAr) {
    throw new Error('Articles not found');
  }

  // Generate URL slug from title
  const slug = topic.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com';

  // Update status to publishing
  await prisma.topic.update({
    where: { id: topicId },
    data: { status: 'publishing' },
  });

  try {
    // Update content library entries with publish info
    const publishedAt = new Date();

    await Promise.all([
      prisma.contentLibrary.update({
        where: { id: contentEn.id },
        data: {
          publishStatus: 'published',
          publishedAt,
          metadata: {
            ...(contentEn.metadata as any),
            slug: `${slug}-en`,
            url: `${baseUrl}/en/blog/${slug}`,
            language: 'en',
          },
        },
      }),
      prisma.contentLibrary.update({
        where: { id: contentAr.id },
        data: {
          publishStatus: 'published',
          publishedAt,
          metadata: {
            ...(contentAr.metadata as any),
            slug: `${slug}-ar`,
            url: `${baseUrl}/ar/blog/${slug}`,
            language: 'ar',
          },
        },
      }),
    ]);

    const enUrl = `${baseUrl}/en/blog/${slug}`;
    const arUrl = `${baseUrl}/ar/blog/${slug}`;

    // Notify Google about new content (both EN and AR)
    await Promise.all([notifyGoogleIndexing(enUrl), notifyGoogleIndexing(arUrl)]);

    // Update topic status
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: 'published',
        metadata: {
          ...metadata,
          publishedAt: publishedAt.toISOString(),
          enUrl,
          arUrl,
          slug,
          scheduledPublishCompletedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Published articles: ${enUrl} & ${arUrl}`);

    return { enUrl, arUrl, publishedAt, slug };
  } catch (publishError) {
    // Revert status on error
    await prisma.topic.update({
      where: { id: topicId },
      data: { status: 'article_approved' },
    });

    throw publishError;
  }
}

/**
 * Generate LinkedIn posts from published articles
 */
async function generateLinkedInForTopic(topicId: string, metadata: any, publishResult: any) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) throw new Error('Topic not found');

  // Get articles
  const [contentEn, contentAr] = await Promise.all([
    prisma.contentLibrary.findUnique({ where: { id: metadata.articleEnId } }),
    prisma.contentLibrary.findUnique({ where: { id: metadata.articleArId } }),
  ]);

  if (!contentEn || !contentAr) {
    throw new Error('Articles not found');
  }

  // Generate LinkedIn posts
  const { linkedinEn, linkedinAr } = await generateBilingualLinkedInPosts(
    topic.title,
    contentEn.content,
    contentAr.content,
    publishResult.enUrl,
    'Khaled Aun'
  );

  // Update topic with LinkedIn posts
  await prisma.topic.update({
    where: { id: topicId },
    data: {
      status: 'linkedin_ready',
      metadata: {
        ...metadata,
        linkedinEn,
        linkedinAr,
        linkedinGeneratedAt: new Date().toISOString(),
      },
    },
  });

  console.log('✅ LinkedIn posts generated');

  return { linkedinEn, linkedinAr };
}

/**
 * Auto-post to LinkedIn (both EN and AR)
 */
async function autoPostLinkedIn(topicId: string, metadata: any, publishResult: any) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { metadata: true },
  });

  if (!topic) throw new Error('Topic not found');

  const updatedMetadata = topic.metadata as any;

  if (!updatedMetadata?.linkedinEn || !updatedMetadata?.linkedinAr) {
    throw new Error('LinkedIn posts not generated');
  }

  let postsCreated = 0;
  const linkedinUrls: string[] = [];

  // Post English version
  try {
    // TODO: Get actual admin user ID instead of 'system'
    const linkedinEnResult = await postToLinkedIn('system', {
      text: updatedMetadata.linkedinEn,
      url: publishResult.enUrl,
    });

    if (linkedinEnResult.success) {
      // Save to website's LinkedIn section
      await prisma.contentLibrary.create({
        data: {
          topicId,
          type: 'social_post',
          format: 'linkedin',
          title: topic.title,
          content: updatedMetadata.linkedinEn,
          publishStatus: 'published',
          publishedAt: new Date(),
          metadata: {
            language: 'en',
            linkedinUrl: linkedinEnResult.permalink,
            articleUrl: publishResult.enUrl,
            postedAt: new Date().toISOString(),
            autoPosted: true,
          },
        },
      });

      linkedinUrls.push(linkedinEnResult.permalink || '');
      postsCreated++;
    }
  } catch (error) {
    console.error('Failed to post English LinkedIn:', error);
  }

  // Post Arabic version
  try {
    const linkedinArResult = await postToLinkedIn('system', {
      text: updatedMetadata.linkedinAr,
      url: publishResult.arUrl,
    });

    if (linkedinArResult.success) {
      await prisma.contentLibrary.create({
        data: {
          topicId,
          type: 'social_post',
          format: 'linkedin',
          title: topic.title,
          content: updatedMetadata.linkedinAr,
          publishStatus: 'published',
          publishedAt: new Date(),
          metadata: {
            language: 'ar',
            linkedinUrl: linkedinArResult.permalink,
            articleUrl: publishResult.arUrl,
            postedAt: new Date().toISOString(),
            autoPosted: true,
          },
        },
      });

      linkedinUrls.push(linkedinArResult.permalink || '');
      postsCreated++;
    }
  } catch (error) {
    console.error('Failed to post Arabic LinkedIn:', error);
  }

  // Update topic status
  if (postsCreated > 0) {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: 'linkedin_published',
        metadata: {
          ...updatedMetadata,
          linkedinUrls,
          linkedinPublishedAt: new Date().toISOString(),
          autoPostedLinkedIn: true,
        },
      },
    });
  }

  console.log(`✅ Auto-posted ${postsCreated} LinkedIn posts`);

  return { success: postsCreated > 0, postsCreated };
}
