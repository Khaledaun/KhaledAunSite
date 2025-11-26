/**
 * Automation Configuration Manager
 * Centralized configuration for all automation features with enable/disable toggles
 */

export interface AutomationConfig {
  // Phase 1 Automations (Already Implemented)
  scheduledPublishing: {
    enabled: boolean;
    cronSchedule: string; // "0 * * * *" (hourly)
    description: string;
  };
  duplicateDetection: {
    enabled: boolean;
    duplicateThreshold: number; // 0.95 = 95% similar
    similarThreshold: number; // 0.70 = 70% similar
    description: string;
  };
  autoLinkedInPosting: {
    enabled: boolean;
    defaultEnabled: boolean; // Default state for new topics
    description: string;
  };

  // Phase 2 Automations (New)
  aiImageSelection: {
    enabled: boolean;
    minRelevanceScore: number; // 0-100
    maxImages: number; // Max images to select
    description: string;
  };
  autoApprovePrompts: {
    enabled: boolean;
    minQualityScore: number; // 0-100
    minLength: number; // Minimum characters
    requireAllElements: boolean; // Must have all SEO/GEO/AIO elements
    description: string;
  };
  performanceTracking: {
    enabled: boolean;
    trackingInterval: number; // Hours between checks
    description: string;
  };

  // Future Automations (Planned)
  autoApproveArticles: {
    enabled: boolean;
    minQualityScore: number;
    description: string;
  };
  smartScheduling: {
    enabled: boolean;
    description: string;
  };
  multiPlatformDistribution: {
    enabled: boolean;
    platforms: string[]; // ['twitter', 'medium', etc.]
    description: string;
  };
}

// Default configuration
export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  // Phase 1 - Already Implemented
  scheduledPublishing: {
    enabled: true,
    cronSchedule: '0 * * * *',
    description: 'Automatically publish approved articles at scheduled date/time',
  },
  duplicateDetection: {
    enabled: true,
    duplicateThreshold: 0.95,
    similarThreshold: 0.70,
    description: 'AI-powered detection of duplicate and similar topics',
  },
  autoLinkedInPosting: {
    enabled: true,
    defaultEnabled: true,
    description: 'Automatically generate and post LinkedIn updates when articles publish',
  },

  // Phase 2 - New Features
  aiImageSelection: {
    enabled: false, // Start disabled, user can enable
    minRelevanceScore: 70,
    maxImages: 5,
    description: 'AI automatically selects relevant images from media library for articles',
  },
  autoApprovePrompts: {
    enabled: false, // Start disabled, user can enable
    minQualityScore: 90,
    minLength: 800,
    requireAllElements: true,
    description: 'Automatically approve high-quality prompts that meet criteria',
  },
  performanceTracking: {
    enabled: true, // Safe to enable by default (read-only)
    trackingInterval: 24,
    description: 'Track content performance and learn from top-performing articles',
  },

  // Future Features - Disabled by default
  autoApproveArticles: {
    enabled: false,
    minQualityScore: 95,
    description: 'AI quality checks with automatic article approval (high risk)',
  },
  smartScheduling: {
    enabled: false,
    description: 'AI determines optimal publishing times based on audience patterns',
  },
  multiPlatformDistribution: {
    enabled: false,
    platforms: [],
    description: 'Automatically distribute content to Twitter, Medium, newsletters, etc.',
  },
};

// In-memory cache for config (loaded from database/env)
let cachedConfig: AutomationConfig | null = null;
let lastLoadTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get current automation configuration
 * Checks cache first, then loads from database/env
 */
export async function getAutomationConfig(): Promise<AutomationConfig> {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && now - lastLoadTime < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    // Try to load from environment variables first (for deployment flexibility)
    const envConfig = loadConfigFromEnv();
    if (envConfig) {
      cachedConfig = envConfig;
      lastLoadTime = now;
      return cachedConfig;
    }

    // Fall back to defaults
    cachedConfig = { ...DEFAULT_AUTOMATION_CONFIG };
    lastLoadTime = now;
    return cachedConfig;
  } catch (error) {
    console.error('Failed to load automation config, using defaults:', error);
    return { ...DEFAULT_AUTOMATION_CONFIG };
  }
}

/**
 * Load config from environment variables
 * Format: AUTOMATION_FEATURE_NAME_enabled=true
 */
function loadConfigFromEnv(): AutomationConfig | null {
  try {
    const config = { ...DEFAULT_AUTOMATION_CONFIG };
    let hasEnvConfig = false;

    // Check for environment overrides
    const features = Object.keys(DEFAULT_AUTOMATION_CONFIG) as Array<
      keyof AutomationConfig
    >;

    for (const feature of features) {
      const enabledKey = `AUTOMATION_${feature.toUpperCase()}_ENABLED`;
      const envValue = process.env[enabledKey];

      if (envValue !== undefined) {
        hasEnvConfig = true;
        (config[feature] as any).enabled = envValue === 'true';
      }
    }

    return hasEnvConfig ? config : null;
  } catch (error) {
    console.error('Error loading config from env:', error);
    return null;
  }
}

/**
 * Update automation configuration
 * Stores in environment/database and clears cache
 */
export async function updateAutomationConfig(
  updates: Partial<AutomationConfig>
): Promise<AutomationConfig> {
  try {
    // Merge with current config
    const currentConfig = await getAutomationConfig();
    const newConfig = {
      ...currentConfig,
      ...updates,
    };

    // In production, you'd save this to database
    // For now, update cache
    cachedConfig = newConfig;
    lastLoadTime = Date.now();

    console.log('✅ Automation config updated:', updates);

    return newConfig;
  } catch (error) {
    console.error('Failed to update automation config:', error);
    throw error;
  }
}

/**
 * Check if a specific automation feature is enabled
 */
export async function isAutomationEnabled(
  feature: keyof AutomationConfig
): Promise<boolean> {
  const config = await getAutomationConfig();
  return config[feature]?.enabled ?? false;
}

/**
 * Clear config cache (force reload on next request)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  lastLoadTime = 0;
}

/**
 * Get feature configuration
 */
export async function getFeatureConfig<K extends keyof AutomationConfig>(
  feature: K
): Promise<AutomationConfig[K]> {
  const config = await getAutomationConfig();
  return config[feature];
}
