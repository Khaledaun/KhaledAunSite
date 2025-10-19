import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

// Phase 8 Full: Cache social embeds for 5 minutes (300 seconds)
export const revalidate = 300;

/**
 * GET /api/social-embed/[key]
 * Fetch a social embed by key
 * Returns null if disabled or not found
 * Cached for 5 minutes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const embed = await prisma.socialEmbed.findUnique({
      where: { key: params.key },
      select: {
        id: true,
        key: true,
        html: true,
        enabled: true,
      },
    });
    
    // Return null if not found or disabled
    if (!embed || !embed.enabled) {
      return NextResponse.json(
        { embed: null },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }
    
    // Return sanitized HTML (already sanitized in admin)
    return NextResponse.json(
      { embed: { html: embed.html, key: embed.key } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching social embed:', error);
    return NextResponse.json(
      { embed: null, error: 'Failed to fetch embed' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }
}

