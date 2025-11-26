/**
 * Automation Settings API
 * GET /api/settings/automation - Get current automation configuration
 * PATCH /api/settings/automation - Update automation settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';
import {
  getAutomationConfig,
  updateAutomationConfig,
  clearConfigCache,
  type AutomationConfig,
} from '@khaledaun/utils/automation-config';

export const dynamic = 'force-dynamic';

/**
 * GET - Retrieve current automation configuration
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth('manageSettings');
    if (!auth.authorized) {
      return auth.response;
    }

    const config = await getAutomationConfig();

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error fetching automation config:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch config',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update automation configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAuth('manageSettings');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates object' },
        { status: 400 }
      );
    }

    // Update configuration
    const newConfig = await updateAutomationConfig(updates);

    // Clear cache to ensure changes take effect immediately
    clearConfigCache();

    console.log('✅ Automation settings updated by:', auth.user?.email);

    return NextResponse.json({
      success: true,
      config: newConfig,
      message: 'Automation settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating automation config:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update config',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Toggle a specific feature on/off
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth('manageSettings');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { feature, enabled } = body;

    if (!feature || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Feature name and enabled flag required' },
        { status: 400 }
      );
    }

    // Get current config
    const currentConfig = await getAutomationConfig();

    // Check if feature exists
    if (!(feature in currentConfig)) {
      return NextResponse.json(
        { error: `Unknown feature: ${feature}` },
        { status: 400 }
      );
    }

    // Update just this feature
    const updates: Partial<AutomationConfig> = {
      [feature]: {
        ...currentConfig[feature as keyof AutomationConfig],
        enabled,
      },
    };

    const newConfig = await updateAutomationConfig(updates);
    clearConfigCache();

    console.log(`✅ ${feature} ${enabled ? 'enabled' : 'disabled'} by:`, auth.user?.email);

    return NextResponse.json({
      success: true,
      feature,
      enabled,
      config: newConfig,
      message: `${feature} ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling automation feature:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to toggle feature',
      },
      { status: 500 }
    );
  }
}
