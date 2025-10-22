import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import { encrypt, decrypt } from '@khaledaun/utils';
import { z } from 'zod';
import { AIProvider, AIUseCase } from '@prisma/client';

// Schema for creating/updating AI config
const aiConfigSchema = z.object({
  provider: z.nativeEnum(AIProvider),
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().min(1, 'Model is required'),
  useCases: z.array(z.nativeEnum(AIUseCase)).default([]),
  systemPrompt: z.string().optional(),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

/**
 * GET /api/admin/ai-config
 * List all AI configurations (with decrypted API keys for admin)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as AIProvider | null;
    const useCase = searchParams.get('useCase') as AIUseCase | null;
    const activeOnly = searchParams.get('active') === 'true';

    // Build where clause
    const where: any = {};
    if (provider) where.provider = provider;
    if (useCase) where.useCases = { has: useCase };
    if (activeOnly) where.active = true;

    const configs = await prisma.aIConfig.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { active: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Decrypt API keys for admin view
    const decryptedConfigs = configs.map(config => ({
      ...config,
      apiKey: decrypt(config.apiKey),
    }));

    return NextResponse.json({ configs: decryptedConfigs });
  } catch (error) {
    console.error('Error fetching AI configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI configurations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-config
 * Create a new AI configuration
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = aiConfigSchema.parse(body);

    // If this is set as default, unset other defaults for the same provider
    if (data.isDefault) {
      await prisma.aIConfig.updateMany({
        where: {
          provider: data.provider,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(data.apiKey);

    const config = await prisma.aIConfig.create({
      data: {
        ...data,
        apiKey: encryptedApiKey,
      },
    });

    // Return with decrypted API key for immediate use
    return NextResponse.json(
      {
        ...config,
        apiKey: data.apiKey, // Return original (decrypted) for display
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating AI config:', error);
    return NextResponse.json(
      { error: 'Failed to create AI configuration' },
      { status: 500 }
    );
  }
}

