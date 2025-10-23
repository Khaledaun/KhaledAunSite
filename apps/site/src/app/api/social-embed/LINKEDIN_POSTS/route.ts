import { NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

export async function GET() {
  try {
    // Fetch 1 pinned post + 2 latest posts
    const [pinnedPost, latestPosts] = await Promise.all([
      // Get the pinned post
      prisma.linkedInPost.findFirst({
        where: { isPinned: true, published: true },
        orderBy: { updatedAt: 'desc' },
      }),
      // Get 2 latest published posts (excluding pinned)
      prisma.linkedInPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 3, // Take 3 to account for potential overlap with pinned
      }),
    ]);

    // Combine: pinned first, then latest (excluding pinned if it appears in latest)
    const posts = [];
    
    if (pinnedPost) {
      posts.push(pinnedPost);
    }
    
    // Add latest posts that aren't the pinned post
    const latestFiltered = latestPosts
      .filter(post => post.id !== pinnedPost?.id)
      .slice(0, 2); // Only take 2
    
    posts.push(...latestFiltered);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    // Return empty array on error to hide section gracefully
    return NextResponse.json({ posts: [] });
  }
}

