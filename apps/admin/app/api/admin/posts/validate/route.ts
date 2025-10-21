import { NextRequest, NextResponse } from 'next/server';
import { validatePost } from '@khaledaun/utils';
import { z } from 'zod';

const validateSchema = z.object({
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  featuredImageId: z.string().optional(),
  locale: z.string().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validateSchema.parse(body);

    const result = await validatePost(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Validation failed',
      },
      { status: 400 }
    );
  }
}



