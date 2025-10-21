import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateContent, generateOutline, generateSEOMetadata, improveContent, generateIdeas } from '@khaledaun/utils';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const generateContentSchema = z.object({
  type: z.enum(['content', 'outline', 'seo', 'improve', 'ideas']),
  topic: z.string().optional(),
  content: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  language: z.enum(['en', 'ar']).optional(),
  keywords: z.array(z.string()).optional(),
  outline: z.string().optional(),
  instructions: z.string().optional(),
  category: z.string().optional(),
  count: z.number().optional(),
  postId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get actual user from auth
    const userId = 'mock-user-id';

    const body = await request.json();
    const data = generateContentSchema.parse(body);

    const startTime = Date.now();
    let output: any;
    let prompt = '';
    let systemPrompt = '';

    // Track generation in database
    const generation = await prisma.aIGeneration.create({
      data: {
        type: data.type === 'content' ? 'CONTENT_DRAFT' : 
              data.type === 'outline' ? 'CONTENT_OUTLINE' :
              data.type === 'seo' ? 'SEO_METADATA' :
              data.type === 'improve' ? 'CONTENT_IMPROVE' : 'CONTENT_IDEAS',
        model: 'GPT4_TURBO',
        prompt: JSON.stringify(data),
        userId,
        postId: data.postId,
        status: 'PROCESSING',
      },
    });

    try {
      // Generate based on type
      switch (data.type) {
        case 'content':
          if (!data.topic) throw new Error('Topic is required for content generation');
          output = await generateContent({
            topic: data.topic,
            tone: data.tone,
            length: data.length,
            language: data.language,
            keywords: data.keywords,
            outline: data.outline,
          });
          prompt = `Generate ${data.length || 'medium'} content about: ${data.topic}`;
          break;

        case 'outline':
          if (!data.topic) throw new Error('Topic is required for outline generation');
          output = await generateOutline(data.topic, data.keywords);
          prompt = `Generate outline for: ${data.topic}`;
          break;

        case 'seo':
          if (!data.content) throw new Error('Content is required for SEO generation');
          output = await generateSEOMetadata({
            content: data.content,
            targetKeywords: data.keywords,
          });
          prompt = 'Generate SEO metadata';
          break;

        case 'improve':
          if (!data.content) throw new Error('Content is required for improvement');
          output = await improveContent(data.content, data.instructions);
          prompt = 'Improve content';
          break;

        case 'ideas':
          if (!data.category) throw new Error('Category is required for idea generation');
          output = await generateIdeas(data.category, data.count || 10);
          prompt = `Generate ${data.count || 10} ideas for: ${data.category}`;
          break;

        default:
          throw new Error('Invalid generation type');
      }

      const duration = Date.now() - startTime;

      // Update generation record
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          output: typeof output === 'string' ? output : JSON.stringify(output),
          status: 'COMPLETED',
          duration,
          completedAt: new Date(),
          // Rough cost estimate (GPT-4 Turbo: $0.01/1K input, $0.03/1K output)
          tokensUsed: Math.ceil((prompt.length + JSON.stringify(output).length) / 4),
          costEstimate: (Math.ceil((prompt.length + JSON.stringify(output).length) / 4) / 1000) * 0.02,
        },
      });

      return NextResponse.json({
        success: true,
        output,
        generationId: generation.id,
        duration,
      });

    } catch (error) {
      // Update generation with error
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}

// GET: List user's AI generations
export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user from auth
    const userId = 'mock-user-id';

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId };
    if (type) where.type = type;

    const generations = await prisma.aIGeneration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        duration: true,
        tokensUsed: true,
        costEstimate: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Calculate totals
    const totalCost = generations.reduce((sum, g) => sum + (g.costEstimate || 0), 0);
    const totalTokens = generations.reduce((sum, g) => sum + (g.tokensUsed || 0), 0);

    return NextResponse.json({
      generations,
      stats: {
        total: generations.length,
        totalCost: totalCost.toFixed(4),
        totalTokens,
      },
    });

  } catch (error) {
    console.error('List generations error:', error);
    return NextResponse.json(
      { error: 'Failed to list generations' },
      { status: 500 }
    );
  }
}

