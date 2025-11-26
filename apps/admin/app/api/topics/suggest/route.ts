import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { generateIdeas } from '@khaledaun/utils/ai-content';

export const dynamic = 'force-dynamic';

/**
 * POST /api/topics/suggest
 * Generate AI-powered topic suggestions based on keywords/category
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageCMS');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { category, keywords = [], count = 10, saveAsDrafts = false } = body;

    if (!category && keywords.length === 0) {
      return NextResponse.json(
        { error: 'Either category or keywords must be provided' },
        { status: 400 }
      );
    }

    // Build search query from category and keywords
    const searchQuery = category
      ? `${category} ${keywords.join(' ')}`
      : keywords.join(' ');

    // Generate topic ideas using AI
    const ideas = await generateIdeas(searchQuery, count);

    // Optionally save as draft topics
    let savedTopics = [];
    if (saveAsDrafts) {
      const { prisma } = await import('@/lib/prisma');

      for (const idea of ideas) {
        const topic = await prisma.topic.create({
          data: {
            title: idea,
            description: `AI-generated topic suggestion for: ${searchQuery}`,
            sourceType: 'ai_suggestion',
            keywords: keywords,
            priority: 5,
            status: 'pending',
            metadata: {
              generatedBy: 'ai',
              category,
              timestamp: new Date().toISOString(),
            },
          },
        });
        savedTopics.push(topic);
      }
    }

    return NextResponse.json({
      success: true,
      suggestions: ideas,
      saved: saveAsDrafts,
      topics: savedTopics,
      count: ideas.length,
    });
  } catch (error) {
    console.error('Error generating topic suggestions:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
