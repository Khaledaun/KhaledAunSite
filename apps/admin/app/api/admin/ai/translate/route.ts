import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { translateContent } from '@khaledaun/utils';
import { z } from 'zod';

const translateSchema = z.object({
  text: z.string(),
  from: z.enum(['en', 'ar']),
  to: z.enum(['en', 'ar']),
  preserveFormatting: z.boolean().optional().default(true),
  postId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get actual user from auth
    const userId = 'mock-user-id';

    const body = await request.json();
    const data = translateSchema.parse(body);

    if (data.from === data.to) {
      return NextResponse.json(
        { error: 'Source and target languages must be different' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Track translation
    const generation = await prisma.aIGeneration.create({
      data: {
        type: 'TRANSLATION',
        model: 'GPT4_TURBO',
        prompt: `Translate ${data.from} to ${data.to}`,
        input: { text: data.text, from: data.from, to: data.to },
        userId,
        postId: data.postId,
        status: 'PROCESSING',
      },
    });

    try {
      // Perform translation
      const translated = await translateContent({
        text: data.text,
        from: data.from,
        to: data.to,
        preserveFormatting: data.preserveFormatting,
      });

      const duration = Date.now() - startTime;

      // Update generation record
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          output: translated,
          status: 'COMPLETED',
          duration,
          completedAt: new Date(),
          tokensUsed: Math.ceil((data.text.length + translated.length) / 4),
          costEstimate: (Math.ceil((data.text.length + translated.length) / 4) / 1000) * 0.015,
        },
      });

      return NextResponse.json({
        success: true,
        translated,
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
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Translation failed',
      },
      { status: 500 }
    );
  }
}

