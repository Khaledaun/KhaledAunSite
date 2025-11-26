import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { generateBilingualLinkedInPosts } from '@khaledaun/utils/content-workflow';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/workflow/generate-linkedin
 * Generate LinkedIn posts from published articles
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

    if (topic.status !== 'published') {
      return NextResponse.json(
        { error: 'Articles must be published before generating LinkedIn posts' },
        { status: 400 }
      );
    }

    if (!metadata?.articleEnId || !metadata?.articleArId) {
      return NextResponse.json({ error: 'Articles not found' }, { status: 404 });
    }

    console.log(`Generating LinkedIn posts for topic: ${topic.title}`);

    // Get articles
    const [contentEn, contentAr] = await Promise.all([
      prisma.contentLibrary.findUnique({ where: { id: metadata.articleEnId } }),
      prisma.contentLibrary.findUnique({ where: { id: metadata.articleArId } }),
    ]);

    if (!contentEn || !contentAr) {
      return NextResponse.json({ error: 'Articles not found' }, { status: 404 });
    }

    const enMetadata = contentEn.metadata as any;
    const arMetadata = contentAr.metadata as any;

    // Generate LinkedIn posts
    const { linkedinEn, linkedinAr } = await generateBilingualLinkedInPosts(
      topic.title,
      contentEn.content,
      contentAr.content,
      enMetadata.url || metadata.enUrl,
      'Khaled Aun' // Author name
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

    return NextResponse.json({
      success: true,
      posts: {
        en: linkedinEn,
        ar: linkedinAr,
      },
    });
  } catch (error) {
    console.error('Error generating LinkedIn posts:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate LinkedIn posts',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
