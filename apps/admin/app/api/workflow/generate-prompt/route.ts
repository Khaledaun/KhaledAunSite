import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import {
  generatePromptForTopic,
  type AuthorProfile,
  type ContentStrategy,
} from '@khaledaun/utils/prompt-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/workflow/generate-prompt
 * Generate comprehensive content prompts for a topic
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

    // Get topic from database
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    console.log(`Generating prompts for topic: ${topic.title}`);

    // Define author profile (customize this based on your preferences)
    const authorProfile: AuthorProfile = {
      name: 'Khaled Aun',
      expertise: [
        'International Business Law',
        'Cross-Border Transactions',
        'Arbitration',
        'Corporate Governance',
        'Compliance',
      ],
      tone: 'professional yet accessible, authoritative with practical insights',
      background: 'Senior legal strategist with experience in international law, dispute resolution, and business advisory. Focus on helping businesses navigate complex legal landscapes.',
      targetAudience: 'Business executives, in-house counsel, entrepreneurs, and corporate decision-makers in MENA region and internationally',
      reputationLevel: 'established', // Update based on your current standing
    };

    // Define content strategy
    const contentStrategy: ContentStrategy = {
      complexity: topic.metadata?.complexity || 'intermediate',
      focus: topic.metadata?.focus || [
        'practical guidance',
        'real-world applications',
        'strategic insights',
      ],
      keywords: topic.keywords || [],
      geoTargets: topic.metadata?.geoTargets || [
        'UAE',
        'Saudi Arabia',
        'Middle East',
        'International',
      ],
      competitorUrls: topic.metadata?.competitorUrls || [],
    };

    // Generate comprehensive prompts
    const { promptEn, promptAr, keywords } = await generatePromptForTopic(
      topic.title,
      authorProfile,
      contentStrategy
    );

    // Update topic with generated prompts
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: 'prompt_ready',
        metadata: {
          ...(topic.metadata as any),
          promptEn,
          promptAr,
          keywords,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
      promptEn,
      promptAr,
      keywords,
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate prompt',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
