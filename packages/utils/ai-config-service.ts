/**
 * AI Configuration Service
 * Manages AI provider configurations from database
 */

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, LanguageModel } from 'ai';
import { decrypt } from './encryption';

// Type for database AIConfig (simplified - only what we need)
export interface AIConfigData {
  id: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'COHERE' | 'CUSTOM';
  name: string;
  apiKey: string; // Encrypted in DB
  model: string;
  useCases: string[];
  systemPrompt?: string | null;
  active: boolean;
  isDefault: boolean;
}

/**
 * Get the appropriate AI model from a config
 * @param config - The AI configuration from database
 * @returns Configured AI model ready for use
 */
export function getModelFromConfig(config: AIConfigData): LanguageModel {
  // Decrypt the API key
  const apiKey = decrypt(config.apiKey);

  switch (config.provider) {
    case 'OPENAI':
      return openai(config.model, { apiKey });

    case 'ANTHROPIC':
      return anthropic(config.model, { apiKey });

    case 'COHERE':
    case 'CUSTOM':
      throw new Error(`Provider ${config.provider} is not yet supported`);

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Generate text using an AI config
 * @param config - The AI configuration
 * @param prompt - The prompt to send
 * @param options - Additional generation options
 */
export async function generateWithConfig(
  config: AIConfigData,
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{ text: string; usage?: any }> {
  const model = getModelFromConfig(config);

  const systemPrompt = options?.systemPrompt || config.systemPrompt || undefined;

  const result = await generateText({
    model,
    prompt,
    system: systemPrompt,
    maxTokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
  });

  return {
    text: result.text,
    usage: result.usage,
  };
}

/**
 * Get default config for a specific use case
 * This function should be called from API routes with access to Prisma
 */
export async function getDefaultConfigForUseCase(
  prisma: any,
  useCase: string
): Promise<AIConfigData | null> {
  // First try to find a default config with this use case
  const defaultConfig = await prisma.aIConfig.findFirst({
    where: {
      active: true,
      isDefault: true,
      useCases: {
        has: useCase,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (defaultConfig) {
    return defaultConfig;
  }

  // If no default found, try to find any active config with this use case
  const anyConfig = await prisma.aIConfig.findFirst({
    where: {
      active: true,
      useCases: {
        has: useCase,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (anyConfig) {
    return anyConfig;
  }

  // If still nothing, fall back to any default active config
  const fallbackConfig = await prisma.aIConfig.findFirst({
    where: {
      active: true,
      isDefault: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return fallbackConfig;
}

/**
 * Get all active configs for a specific use case
 */
export async function getConfigsForUseCase(
  prisma: any,
  useCase: string
): Promise<AIConfigData[]> {
  return await prisma.aIConfig.findMany({
    where: {
      active: true,
      useCases: {
        has: useCase,
      },
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' },
    ],
  });
}

