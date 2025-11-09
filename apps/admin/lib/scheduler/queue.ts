/**
 * Publishing Queue & Scheduler
 * Handles scheduled LinkedIn posts with retry logic
 */

import { prisma } from '@/lib/prisma';
import { postToLinkedIn } from '@/lib/linkedin/posting';

export interface QueuedPost {
  id: string;
  contentId: string;
  userId: string;
  scheduledFor: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastError?: string;
}

/**
 * Process due scheduled posts
 * Called by cron job every minute
 */
export async function processScheduledPosts(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Find content that's scheduled and due to be published
    const dueContent = await prisma.contentLibrary.findMany({
      where: {
        publishStatus: 'QUEUED',
        scheduledFor: {
          lte: new Date(), // Due now or in the past
        },
        publishedTo: {
          has: 'linkedin',
        },
      },
      take: 10, // Process max 10 at a time
    });

    console.log(`Found ${dueContent.length} posts to publish`);

    for (const content of dueContent) {
      results.processed++;

      try {
        // Mark as processing
        await prisma.contentLibrary.update({
          where: { id: content.id },
          data: {
            publishStatus: 'POSTING',
            lastPublishAttempt: new Date(),
          },
        });

        // Attempt to post
        const result = await postToLinkedIn(content.authorId || '', {
          text: `${content.title}\n\n${content.summary || ''}`,
          url: content.blogPostId
            ? `https://khaledaun.com/blog/${content.blogPostId}`
            : undefined,
          imageUrl:
            content.mediaIds && content.mediaIds.length > 0
              ? await getMediaUrl(content.mediaIds[0])
              : undefined,
        });

        if (result.success) {
          // Success - update content
          const publishedLinks =
            (content.publishedLinks as Record<string, string>) || {};
          publishedLinks.linkedin = result.permalink || '';

          await prisma.contentLibrary.update({
            where: { id: content.id },
            data: {
              publishStatus: 'POSTED',
              publishedLinks,
              publishAttempts: {
                increment: 1,
              },
              lastPublishAttempt: new Date(),
              lastPublishError: null,
            },
          });

          results.succeeded++;
          console.log(`✅ Published: ${content.title}`);
        } else {
          // Failed - retry or mark as failed
          const attempts = (content.publishAttempts || 0) + 1;
          const maxRetries = 3;

          if (attempts >= maxRetries) {
            // Max retries reached
            await prisma.contentLibrary.update({
              where: { id: content.id },
              data: {
                publishStatus: 'FAILED',
                publishAttempts: attempts,
                lastPublishAttempt: new Date(),
                lastPublishError: result.error || 'Unknown error',
              },
            });

            results.failed++;
            results.errors.push(
              `${content.title}: ${result.error} (max retries reached)`
            );
            console.error(`❌ Failed (max retries): ${content.title}`);
          } else {
            // Retry with exponential backoff
            const backoffMinutes = Math.pow(2, attempts) * 5; // 10, 20, 40 minutes
            const nextRetry = new Date();
            nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes);

            await prisma.contentLibrary.update({
              where: { id: content.id },
              data: {
                publishStatus: 'QUEUED',
                publishAttempts: attempts,
                scheduledFor: nextRetry,
                lastPublishAttempt: new Date(),
                lastPublishError: result.error || 'Unknown error',
              },
            });

            results.errors.push(
              `${content.title}: ${result.error} (will retry at ${nextRetry.toISOString()})`
            );
            console.warn(`⚠️  Failed (will retry): ${content.title}`);
          }
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        results.failed++;
        results.errors.push(`${content.title}: ${errorMsg}`);

        // Update content with error
        await prisma.contentLibrary.update({
          where: { id: content.id },
          data: {
            publishStatus: 'FAILED',
            publishAttempts: {
              increment: 1,
            },
            lastPublishAttempt: new Date(),
            lastPublishError: errorMsg,
          },
        });

        console.error(`❌ Exception: ${content.title}`, error);
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
    results.errors.push(
      `Scheduler error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return results;
}

/**
 * Schedule a post for future publishing
 */
export async function schedulePost(
  contentId: string,
  scheduledFor: Date,
  targets: string[] = ['linkedin']
): Promise<void> {
  await prisma.contentLibrary.update({
    where: { id: contentId },
    data: {
      publishStatus: 'QUEUED',
      publishedTo: targets,
      scheduledFor,
      publishAttempts: 0,
      lastPublishError: null,
    },
  });

  console.log(`📅 Scheduled: ${contentId} for ${scheduledFor.toISOString()}`);
}

/**
 * Cancel a scheduled post
 */
export async function cancelScheduledPost(contentId: string): Promise<void> {
  await prisma.contentLibrary.update({
    where: { id: contentId },
    data: {
      publishStatus: 'DRAFT',
      publishedTo: [],
      scheduledFor: null,
      lastPublishError: null,
    },
  });

  console.log(`🚫 Cancelled scheduled post: ${contentId}`);
}

/**
 * Get media URL from media library
 */
async function getMediaUrl(mediaId: string): Promise<string | undefined> {
  try {
    const media = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      select: { url: true },
    });
    return media?.url || undefined;
  } catch (error) {
    console.error('Failed to get media URL:', error);
    return undefined;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  queued: number;
  processing: number;
  failed: number;
  nextScheduled?: Date;
}> {
  const [queued, processing, failed, next] = await Promise.all([
    prisma.contentLibrary.count({
      where: { publishStatus: 'QUEUED' },
    }),
    prisma.contentLibrary.count({
      where: { publishStatus: 'POSTING' },
    }),
    prisma.contentLibrary.count({
      where: { publishStatus: 'FAILED' },
    }),
    prisma.contentLibrary.findFirst({
      where: {
        publishStatus: 'QUEUED',
        scheduledFor: { gte: new Date() },
      },
      orderBy: { scheduledFor: 'asc' },
      select: { scheduledFor: true },
    }),
  ]);

  return {
    queued,
    processing,
    failed,
    nextScheduled: next?.scheduledFor || undefined,
  };
}

