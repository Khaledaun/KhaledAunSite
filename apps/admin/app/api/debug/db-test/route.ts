import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - never pre-render during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to count posts
    const postCount = await prisma.post.count();
    
    // Try to count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        postCount,
        userCount,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET - THIS IS THE PROBLEM!',
    }, { status: 500 });
  }
}

