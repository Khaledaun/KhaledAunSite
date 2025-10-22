import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission } from '@khaledaun/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeSocialEmbed, validateEmbedKey } from '@khaledaun/utils/sanitize';

/**
 * GET /api/admin/social
 * List all social embeds
 * Phase 8 Full: EDITOR+ can view
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // EDITOR+ can view social embeds
    requirePermission(user, 'editSocialEmbed');
    
    const embeds = await prisma.socialEmbed.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ embeds });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - EDITOR role or higher required' },
          { status: 403 }
        );
      }
    }
    
    console.error('Error fetching social embeds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/social
 * Create or update (upsert) a social embed
 * Phase 8 Full: EDITOR+ can create/update
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // EDITOR+ can create/edit
    requirePermission(user, 'createSocialEmbed');
    
    const body = await request.json();
    const { key, html, enabled } = body;
    
    // Validate required fields
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Key is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!html || typeof html !== 'string') {
      return NextResponse.json(
        { error: 'HTML is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Validate key format (uppercase, numbers, underscores only)
    if (!validateEmbedKey(key)) {
      return NextResponse.json(
        { error: 'Key must contain only uppercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }
    
    // Sanitize HTML before saving
    const sanitizedHtml = sanitizeSocialEmbed(html);
    
    // Upsert the embed
    const embed = await prisma.socialEmbed.upsert({
      where: { key },
      update: {
        html: sanitizedHtml,
        enabled: enabled ?? true,
        updatedBy: user.id,
      },
      create: {
        key,
        html: sanitizedHtml,
        enabled: enabled ?? true,
        updatedBy: user.id,
      },
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'SocialEmbed',
        entityId: embed.id,
        action: 'UPSERT',
        payload: {
          key: embed.key,
          enabled: embed.enabled,
        },
        actorId: user.id,
      },
    });
    
    return NextResponse.json({ embed });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - EDITOR role or higher required' },
          { status: 403 }
        );
      }
    }
    
    console.error('Error upserting social embed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

