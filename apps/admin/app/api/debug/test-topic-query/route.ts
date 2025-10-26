import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test 1: Check if we can connect to the database
    const canConnect = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test 2: Try to query the topics table
    const topics = await prisma.topic.findMany({
      take: 5,
    });
    
    return NextResponse.json({
      success: true,
      canConnect: !!canConnect,
      topicsCount: topics.length,
      topics: topics,
      message: 'Successfully queried topics table'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      name: error.name,
    }, { status: 500 });
  }
}

