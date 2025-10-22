import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';

/**
 * GET /api/admin/leads/[id]
 * Get a single lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/leads/[id]
 * Update a lead (status, tags, nextActionAt, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { status, tags, nextActionAt, organization, country } = body;

    // Check if lead exists
    const existing = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update lead
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(tags !== undefined && { tags }),
        ...(nextActionAt !== undefined && { 
          nextActionAt: nextActionAt ? new Date(nextActionAt) : null 
        }),
        ...(organization !== undefined && { organization }),
        ...(country !== undefined && { country }),
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads/[id]
 * Delete a lead (soft delete - just archives it)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if lead exists
    const existing = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Soft delete - just mark as ARCHIVED
    await prisma.lead.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

