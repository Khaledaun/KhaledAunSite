import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if the Prisma client has the Sprint 1 models
    const models = Object.keys(prisma).filter(key => 
      key.charAt(0) === key.charAt(0).toLowerCase() && 
      !key.startsWith('_') &&
      !key.startsWith('$')
    );

    return NextResponse.json({
      success: true,
      availableModels: models,
      hasTopicModel: 'topic' in prisma,
      hasContentLibraryModel: 'contentLibrary' in prisma,
      hasMediaLibraryModel: 'mediaLibrary' in prisma,
      prismaVersion: require('@prisma/client/package.json').version,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

