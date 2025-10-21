import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { extractFromURL, validateURL } from '@khaledaun/utils';
import { z } from 'zod';

const extractSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get actual user from auth
    const userId = 'mock-user-id';

    const body = await request.json();
    const { url } = extractSchema.parse(body);

    // Validate URL first
    const isValid = await validateURL(url);
    if (!isValid) {
      return NextResponse.json(
        { error: 'URL is not accessible or does not contain HTML content' },
        { status: 400 }
      );
    }

    // Create extraction record
    const extraction = await prisma.uRLExtraction.create({
      data: {
        url,
        userId,
        status: 'PENDING',
      },
    });

    try {
      // Extract content
      const extracted = await extractFromURL(url);

      // Update extraction record
      await prisma.uRLExtraction.update({
        where: { id: extraction.id },
        data: {
          title: extracted.title,
          author: extracted.author,
          publishedDate: extracted.publishedDate,
          content: extracted.content,
          excerpt: extracted.excerpt,
          imageUrl: extracted.imageUrl,
          siteName: extracted.siteName,
          language: extracted.language,
          wordCount: extracted.wordCount,
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        extracted,
        extractionId: extraction.id,
      });

    } catch (error) {
      // Update extraction with error
      await prisma.uRLExtraction.update({
        where: { id: extraction.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }

  } catch (error) {
    console.error('URL extraction error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Extraction failed',
      },
      { status: 500 }
    );
  }
}

// GET: List user's URL extractions
export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user from auth
    const userId = 'mock-user-id';

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const extractions = await prisma.uRLExtraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        url: true,
        title: true,
        author: true,
        publishedDate: true,
        excerpt: true,
        imageUrl: true,
        siteName: true,
        wordCount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      extractions,
      total: extractions.length,
    });

  } catch (error) {
    console.error('List extractions error:', error);
    return NextResponse.json(
      { error: 'Failed to list extractions' },
      { status: 500 }
    );
  }
}

