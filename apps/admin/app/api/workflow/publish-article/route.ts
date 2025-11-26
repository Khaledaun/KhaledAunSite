import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { notifyGoogleIndexing } from '@khaledaun/utils/content-workflow';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workflow/publish-article
 * Publish approved articles to the public website
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { topicId } = body;

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

    if (!metadata?.articleEnId || !metadata?.articleArId) {
      return NextResponse.json(
        { error: 'Articles not generated yet' },
        { status: 400 }
      );
    }

    if (topic.status !== 'article_approved' && topic.status !== 'article_ready') {
      return NextResponse.json(
        { error: 'Articles must be approved before publishing' },
        { status: 400 }
      );
    }

    console.log(`Publishing articles for topic: ${topic.title}`);

    // Get articles from content library
    const [contentEn, contentAr] = await Promise.all([
      prisma.contentLibrary.findUnique({ where: { id: metadata.articleEnId } }),
      prisma.contentLibrary.findUnique({ where: { id: metadata.articleArId } }),
    ]);

    if (!contentEn || !contentAr) {
      return NextResponse.json({ error: 'Articles not found' }, { status: 404 });
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
      await Promise.all([
        notifyGoogleIndexing(enUrl),
        notifyGoogleIndexing(arUrl),
      ]);

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
          },
        },
      });

      console.log(`✅ Published articles: ${enUrl} & ${arUrl}`);

      return NextResponse.json({
        success: true,
        urls: {
          en: enUrl,
          ar: arUrl,
        },
        publishedAt,
      });
    } catch (publishError) {
      // Revert status on error
      await prisma.topic.update({
        where: { id: topicId },
        data: { status: 'article_approved' },
      });

      throw publishError;
    }
  } catch (error) {
    console.error('Error publishing articles:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to publish articles',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
