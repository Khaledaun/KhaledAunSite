import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { getSessionUser } from '@khaledaun/auth';

export async function GET() {
  try {
    console.log('[DEBUG] Starting posts fetch test...');
    
    // Test 1: Get session user
    console.log('[DEBUG] Getting session user...');
    const user = await getSessionUser();
    console.log('[DEBUG] Session user:', user);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No user session',
        step: 'getSessionUser'
      }, { status: 401 });
    }
    
    // Test 2: Query posts
    console.log('[DEBUG] Querying posts...');
    const where = user.role === 'AUTHOR' ? { authorId: user.id } : {};
    console.log('[DEBUG] Query where clause:', where);
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, email: true, name: true, role: true }
        },
        translations: {
          select: { id: true, locale: true, title: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('[DEBUG] Posts found:', posts.length);
    
    return NextResponse.json({
      success: true,
      message: 'Posts fetched successfully',
      data: {
        user,
        postCount: posts.length,
        posts: posts.slice(0, 2), // Only return first 2 for debugging
      }
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
    }, { status: 500 });
  }
}

