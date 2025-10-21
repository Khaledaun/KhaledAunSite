import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';
import { encrypt, decrypt } from '@khaledaun/utils';
import { z } from 'zod';
import { AIProvider, AIUseCase } from '@prisma/client';

// Schema for updating AI config
const updateConfigSchema = z.object({
  provider: z.nativeEnum(AIProvider).optional(),
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  useCases: z.array(z.nativeEnum(AIUseCase)).optional(),
  systemPrompt: z.string().optional(),
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/admin/ai-config/[id]
 * Get a single AI configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const config = await prisma.aIConfig.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'AI configuration not found' },
        { status: 404 }
      );
    }

    // Decrypt API key for admin view
    return NextResponse.json({
      ...config,
      apiKey: decrypt(config.apiKey),
    });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-config/[id]
 * Update an AI configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateConfigSchema.parse(body);

    // Check if config exists
    const existing = await prisma.aIConfig.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'AI configuration not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults for the same provider
    if (data.isDefault && data.provider) {
      await prisma.aIConfig.updateMany({
        where: {
          provider: data.provider,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Prepare update data
    const updateData: any = { ...data };
    
    // Encrypt API key if it's being updated
    if (data.apiKey) {
      updateData.apiKey = encrypt(data.apiKey);
    }

    const config = await prisma.aIConfig.update({
      where: { id: params.id },
      data: updateData,
    });

    // Return with decrypted API key
    return NextResponse.json({
      ...config,
      apiKey: data.apiKey || decrypt(config.apiKey),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating AI config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-config/[id]
 * Delete an AI configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if config exists
    const existing = await prisma.aIConfig.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'AI configuration not found' },
        { status: 404 }
      );
    }

    await prisma.aIConfig.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI config:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI configuration' },
      { status: 500 }
    );
  }
}

