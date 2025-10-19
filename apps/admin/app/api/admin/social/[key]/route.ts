import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';
import { sanitizeSocialEmbed, validateEmbedKey } from '@khaledaun/utils/sanitize';

/**
 * GET /api/admin/social/[key]
 * Get a single social embed by key
 * Phase 8 Full: EDITOR+ can view
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // EDITOR+ can view
    requirePermission(user, 'editSocialEmbed');
    
    const embed = await prisma.socialEmbed.findUnique({
      where: { key: params.key },
    });
    
    if (!embed) {
      return NextResponse.json(
        { error: 'Social embed not found' },
        { status: 404 }
      );
    }
    
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
    
    console.error('Error fetching social embed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/social/[key]
 * Update an existing social embed
 * Phase 8 Full: EDITOR+ can update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // EDITOR+ can edit
    requirePermission(user, 'editSocialEmbed');
    
    const body = await request.json();
    const { html, enabled } = body;
    
    // Check if embed exists
    const existing = await prisma.socialEmbed.findUnique({
      where: { key: params.key },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Social embed not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      updatedBy: user.id,
    };
    
    if (html !== undefined) {
      // Sanitize HTML before saving
      updateData.html = sanitizeSocialEmbed(html);
    }
    
    if (enabled !== undefined) {
      updateData.enabled = enabled;
    }
    
    // Update the embed
    const embed = await prisma.socialEmbed.update({
      where: { key: params.key },
      data: updateData,
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'SocialEmbed',
        entityId: embed.id,
        action: 'UPDATE',
        payload: {
          key: embed.key,
          enabled: embed.enabled,
          fieldsUpdated: Object.keys(updateData),
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
    
    console.error('Error updating social embed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/social/[key]
 * Delete a social embed
 * Phase 8 Full: ADMIN+ only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // ADMIN+ can delete
    requirePermission(user, 'deleteSocialEmbed');
    
    // Check if embed exists
    const existing = await prisma.socialEmbed.findUnique({
      where: { key: params.key },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Social embed not found' },
        { status: 404 }
      );
    }
    
    // Delete the embed
    await prisma.socialEmbed.delete({
      where: { key: params.key },
    });
    
    // Create audit trail
    await prisma.audit.create({
      data: {
        entity: 'SocialEmbed',
        entityId: existing.id,
        action: 'DELETE',
        payload: {
          key: existing.key,
        },
        actorId: user.id,
      },
    });
    
    return NextResponse.json({ 
      message: 'Social embed deleted successfully',
      key: params.key,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - ADMIN role or higher required' },
          { status: 403 }
        );
      }
    }
    
    console.error('Error deleting social embed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

