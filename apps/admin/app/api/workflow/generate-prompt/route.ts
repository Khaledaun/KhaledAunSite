import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import {
  generatePromptForTopic,
  type AuthorProfile,
  type ContentStrategy,
} from '@khaledaun/utils/prompt-generator';
import { checkPromptQuality } from '@khaledaun/utils/prompt-quality-checker';
import { isAutomationEnabled } from '@khaledaun/utils/automation-config';

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

    // Check prompt quality for auto-approval (if enabled)
    const autoApprovalEnabled = await isAutomationEnabled('autoApprovePrompts');
    let finalStatus = 'prompt_ready';
    let qualityCheck = null;

    if (autoApprovalEnabled) {
      console.log('🤖 Checking prompt quality for auto-approval...');

      qualityCheck = await checkPromptQuality(promptEn, topic.title);

      if (qualityCheck.recommendation === 'auto_approve') {
        finalStatus = 'prompt_approved';
        console.log(`✅ Auto-approved prompt (score: ${qualityCheck.score}/100)`);
      } else if (qualityCheck.recommendation === 'reject') {
        console.log(`⚠️ Prompt quality insufficient (score: ${qualityCheck.score}/100)`);
      } else {
        console.log(`📋 Flagging for manual review (score: ${qualityCheck.score}/100)`);
      }
    }

    // Update topic with generated prompts
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: finalStatus,
        metadata: {
          ...(topic.metadata as any),
          promptEn,
          promptAr,
          keywords,
          generatedAt: new Date().toISOString(),
          qualityCheck: qualityCheck ? {
            score: qualityCheck.score,
            passed: qualityCheck.passed,
            recommendation: qualityCheck.recommendation,
            reasoning: qualityCheck.reasoning,
            autoApproved: qualityCheck.recommendation === 'auto_approve',
          } : undefined,
        },
      },
    });

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
      autoApproved: finalStatus === 'prompt_approved',
      qualityScore: qualityCheck?.score,
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
