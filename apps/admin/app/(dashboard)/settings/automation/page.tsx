'use client';

import { useState, useEffect } from 'react';
import {
  Power,
  PowerOff,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
} from 'lucide-react';
import type { AutomationConfig } from '@khaledaun/utils/automation-config';

interface FeatureCardProps {
  title: string;
  description: string;
  enabled: boolean;
  phase: 'Phase 1' | 'Phase 2' | 'Future';
  riskLevel: 'Low' | 'Medium' | 'High';
  timeSaved?: string;
  onToggle: () => void;
  settings?: React.ReactNode;
}

function FeatureCard({
  title,
  description,
  enabled,
  phase,
  riskLevel,
  timeSaved,
  onToggle,
  settings,
}: FeatureCardProps) {
  const [showSettings, setShowSettings] = useState(false);

  const riskColors = {
    Low: 'text-green-700 bg-green-50 border-green-200',
    Medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    High: 'text-red-700 bg-red-50 border-red-200',
  };

  const phaseColors = {
    'Phase 1': 'text-blue-700 bg-blue-50',
    'Phase 2': 'text-purple-700 bg-purple-50',
    Future: 'text-gray-700 bg-gray-50',
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        enabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${phaseColors[phase]}`}>
              {phase}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${riskColors[riskLevel]}`}>
              {riskLevel} Risk
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {timeSaved && (
            <p className="text-xs text-green-600 font-medium">⏱️ Saves ~{timeSaved}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          {settings && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Configure"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
          )}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              enabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {enabled ? (
              <>
                <Power className="h-4 w-4" />
                Enabled
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4" />
                Disabled
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && settings && (
        <div className="mt-4 pt-4 border-t border-gray-200">{settings}</div>
      )}
    </div>
  );
}

export default function AutomationSettingsPage() {
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/settings/automation');
      if (!response.ok) throw new Error('Failed to load config');
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (feature: keyof AutomationConfig) => {
    if (!config) return;

    setSaving(true);
    try {
      const enabled = !config[feature].enabled;

      const response = await fetch('/api/settings/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, enabled }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      const data = await response.json();
      setConfig(data.config);

      setMessage({
        type: 'success',
        text: `${feature} ${enabled ? 'enabled' : 'disabled'} successfully`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update setting',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!config) {
    return <div className="p-6 text-center text-red-600">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enable or disable automation features to control your workflow
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">How Automation Works</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>
                <strong>Phase 1</strong> features are proven and safe (zero risk)
              </li>
              <li>
                <strong>Phase 2</strong> features use AI but include safety checks
              </li>
              <li>
                <strong>Future</strong> features require careful consideration before enabling
              </li>
              <li>All automations can be enabled/disabled individually</li>
              <li>Changes take effect immediately</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Phase 1 - Already Implemented */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Phase 1: Proven Automations</h2>

        <FeatureCard
          title="Scheduled Publishing"
          description={config.scheduledPublishing.description}
          enabled={config.scheduledPublishing.enabled}
          phase="Phase 1"
          riskLevel="Low"
          timeSaved="Eliminates manual timing"
          onToggle={() => toggleFeature('scheduledPublishing')}
        />

        <FeatureCard
          title="Duplicate Detection"
          description={config.duplicateDetection.description}
          enabled={config.duplicateDetection.enabled}
          phase="Phase 1"
          riskLevel="Low"
          timeSaved="30% less reviews"
          onToggle={() => toggleFeature('duplicateDetection')}
          settings={
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Duplicate Threshold (≥95% = duplicate)</label>
                <input
                  type="range"
                  min="85"
                  max="100"
                  value={config.duplicateDetection.duplicateThreshold * 100}
                  className="w-full"
                  disabled
                />
                <span className="text-gray-600">
                  {(config.duplicateDetection.duplicateThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          }
        />

        <FeatureCard
          title="Auto LinkedIn Posting"
          description={config.autoLinkedInPosting.description}
          enabled={config.autoLinkedInPosting.enabled}
          phase="Phase 1"
          riskLevel="Low"
          timeSaved="5 min per topic"
          onToggle={() => toggleFeature('autoLinkedInPosting')}
        />
      </div>

      {/* Phase 2 - New Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Phase 2: AI-Enhanced Automations</h2>

        <FeatureCard
          title="AI Image Selection"
          description={config.aiImageSelection.description}
          enabled={config.aiImageSelection.enabled}
          phase="Phase 2"
          riskLevel="Low"
          timeSaved="3 min per topic"
          onToggle={() => toggleFeature('aiImageSelection')}
          settings={
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                Min Relevance: {config.aiImageSelection.minRelevanceScore}/100 | Max Images:{' '}
                {config.aiImageSelection.maxImages}
              </p>
            </div>
          }
        />

        <FeatureCard
          title="Auto-Approve Prompts"
          description={config.autoApprovePrompts.description}
          enabled={config.autoApprovePrompts.enabled}
          phase="Phase 2"
          riskLevel="Medium"
          timeSaved="2 min per topic"
          onToggle={() => toggleFeature('autoApprovePrompts')}
          settings={
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                Min Quality Score: {config.autoApprovePrompts.minQualityScore}/100
              </p>
              <p className="text-gray-600">
                Min Length: {config.autoApprovePrompts.minLength} characters
              </p>
            </div>
          }
        />

        <FeatureCard
          title="Performance Tracking"
          description={config.performanceTracking.description}
          enabled={config.performanceTracking.enabled}
          phase="Phase 2"
          riskLevel="Low"
          timeSaved="Improves ROI"
          onToggle={() => toggleFeature('performanceTracking')}
        />
      </div>

      {/* Future Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Future: Advanced Automations</h2>

        <FeatureCard
          title="Auto-Approve Articles"
          description={config.autoApproveArticles.description}
          enabled={config.autoApproveArticles.enabled}
          phase="Future"
          riskLevel="High"
          timeSaved="20 min per topic"
          onToggle={() => toggleFeature('autoApproveArticles')}
        />

        <FeatureCard
          title="Smart Scheduling"
          description={config.smartScheduling.description}
          enabled={config.smartScheduling.enabled}
          phase="Future"
          riskLevel="Low"
          onToggle={() => toggleFeature('smartScheduling')}
        />

        <FeatureCard
          title="Multi-Platform Distribution"
          description={config.multiPlatformDistribution.description}
          enabled={config.multiPlatformDistribution.enabled}
          phase="Future"
          riskLevel="Medium"
          timeSaved="10 min per topic"
          onToggle={() => toggleFeature('multiPlatformDistribution')}
        />
      </div>

      {/* Stats Summary */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Automation Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {Object.values(config).filter((f) => f.enabled).length}
            </p>
            <p className="text-sm text-gray-600">Features Enabled</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {Object.values(config).length}
            </p>
            <p className="text-sm text-gray-600">Total Features</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              ~{calculateTimeSaved(config)} min
            </p>
            <p className="text-sm text-gray-600">Time Saved Per Topic</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateTimeSaved(config: AutomationConfig): number {
  let saved = 0;

  if (config.scheduledPublishing.enabled) saved += 5;
  if (config.duplicateDetection.enabled) saved += 2;
  if (config.autoLinkedInPosting.enabled) saved += 5;
  if (config.aiImageSelection.enabled) saved += 3;
  if (config.autoApprovePrompts.enabled) saved += 2;
  if (config.autoApproveArticles.enabled) saved += 20;
  if (config.multiPlatformDistribution.enabled) saved += 10;

  return saved;
}
