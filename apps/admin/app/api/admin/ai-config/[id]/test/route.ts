import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import { decrypt } from '@khaledaun/utils';
import { generateText } from 'ai';

/**
 * POST /api/admin/ai-config/[id]/test
 * Test an AI configuration to verify it works
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Get the config
    const config = await prisma.aIConfig.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'AI configuration not found' },
        { status: 404 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(config.apiKey);

    // Test the configuration with a simple prompt
    let testResult;
    
    try {
      switch (config.provider) {
        case 'OPENAI': {
          const { createOpenAI } = await import('@ai-sdk/openai');
          const openaiProvider = createOpenAI({ apiKey });
          const model = openaiProvider(config.model);
          const { text } = await generateText({
            model,
            prompt: 'Say "Hello, I am working!" in one sentence.',
            maxTokens: 50,
          });
          testResult = { success: true, response: text };
          break;
        }

        case 'ANTHROPIC': {
          const { createAnthropic } = await import('@ai-sdk/anthropic');
          const anthropicProvider = createAnthropic({ apiKey });
          const model = anthropicProvider(config.model);
          const { text } = await generateText({
            model,
            prompt: 'Say "Hello, I am working!" in one sentence.',
            maxTokens: 50,
          });
          testResult = { success: true, response: text };
          break;
        }

        case 'COHERE':
        case 'CUSTOM':
          return NextResponse.json(
            { error: `Testing for ${config.provider} is not yet implemented` },
            { status: 501 }
          );

        default:
          return NextResponse.json(
            { error: 'Unknown provider' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        message: 'Configuration test successful',
        ...testResult,
      });
    } catch (apiError: any) {
      console.error('API test failed:', apiError);
      return NextResponse.json(
        {
          success: false,
          error: 'API test failed',
          details: apiError.message || 'Unknown error',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error testing AI config:', error);
    return NextResponse.json(
      { error: 'Failed to test AI configuration' },
      { status: 500 }
    );
  }
}

