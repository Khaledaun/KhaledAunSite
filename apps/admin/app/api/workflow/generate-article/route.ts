import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { generateBilingualArticles } from '@khaledaun/utils/content-workflow';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for article generation

/**
 * POST /api/workflow/generate-article
 * Generate bilingual articles from approved prompts
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { topicId, mediaIds = [] } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    // Get topic with prompts
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const metadata = topic.metadata as any;

    if (!metadata?.promptEn || !metadata?.promptAr) {
      return NextResponse.json(
        { error: 'Prompts not generated yet. Generate prompts first.' },
        { status: 400 }
      );
    }

    if (topic.status !== 'prompt_approved' && topic.status !== 'prompt_ready') {
      return NextResponse.json(
        { error: 'Topic must be in prompt_approved or prompt_ready status' },
        { status: 400 }
      );
    }

    console.log(`Generating articles for topic: ${topic.title}`);

    // Update status to generating
    await prisma.topic.update({
      where: { id: topicId },
      data: { status: 'article_generating' },
    });

    // Generate articles
    const { articleEn, articleAr } = await generateBilingualArticles(
      metadata.promptEn,
      metadata.promptAr,
      mediaIds
    );

    // Create content library entries
    const contentEn = await prisma.contentLibrary.create({
      data: {
        topicId,
        type: 'article',
        format: 'blog',
        title: topic.title,
        content: articleEn,
        keywords: topic.keywords,
        publishStatus: 'draft',
        metadata: {
          language: 'en',
          generatedAt: new Date().toISOString(),
          mediaIds,
        },
      },
    });

    const contentAr = await prisma.contentLibrary.create({
      data: {
        topicId,
        type: 'article',
        format: 'blog',
        title: topic.title,
        content: articleAr,
        keywords: topic.keywords,
        publishStatus: 'draft',
        metadata: {
          language: 'ar',
          generatedAt: new Date().toISOString(),
          mediaIds,
        },
      },
    });

    // Update topic status
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: 'article_ready',
        metadata: {
          ...metadata,
          articleEnId: contentEn.id,
          articleArId: contentAr.id,
          mediaIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      articleEn: {
        id: contentEn.id,
        content: articleEn,
      },
      articleAr: {
        id: contentAr.id,
        content: articleAr,
      },
    });
  } catch (error) {
    console.error('Error generating articles:', error);

    // Revert status on error
    try {
      const { topicId } = await request.json();
      await prisma.topic.update({
        where: { id: topicId },
        data: { status: 'prompt_approved' },
      });
    } catch (e) {
      // Ignore revert errors
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate articles',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
