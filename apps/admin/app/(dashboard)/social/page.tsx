'use client';

import { useEffect, useState } from 'react';

interface SocialEmbed {
  id: string;
  key: string;
  html: string;
  enabled: boolean;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function SocialEmbedsPage() {
  const [embeds, setEmbeds] = useState<SocialEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [formKey, setFormKey] = useState('');
  const [formHtml, setFormHtml] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmbeds();
  }, []);

  const fetchEmbeds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/social');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch embeds');
      }
      
      const data = await response.json();
      setEmbeds(data.embeds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedKey('');
    setFormKey('');
    setFormHtml('');
    setFormEnabled(true);
    setIsEditing(false);
  };

  const handleEdit = (embed: SocialEmbed) => {
    setSelectedKey(embed.key);
    setFormKey(embed.key);
    setFormHtml(embed.html);
    setFormEnabled(embed.enabled);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formKey.trim()) {
        alert('Key is required');
        return;
      }

      if (!formHtml.trim()) {
        alert('HTML is required');
        return;
      }

      // Validate key format (uppercase, numbers, underscores)
      if (!/^[A-Z0-9_]+$/.test(formKey)) {
        alert('Key must contain only uppercase letters, numbers, and underscores');
        return;
      }

      const response = await fetch('/api/admin/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: formKey,
          html: formHtml,
          enabled: formEnabled,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save embed');
      }

      await fetchEmbeds();
      handleNew(); // Reset form
      alert('Social embed saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save embed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the embed "${key}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/social/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete embed');
      }

      await fetchEmbeds();
      if (selectedKey === key) {
        handleNew();
      }
      alert('Social embed deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete embed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Social Media Embeds</h1>
        <p className="text-gray-600 mt-2">
          Manage social media embeds for your site. HTML is automatically sanitized for security.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Embeds List */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Existing Embeds</h2>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              data-testid="social-new"
            >
              New Embed
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading embeds...</p>
            </div>
          ) : embeds.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No social embeds yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {embeds.map((embed) => (
                <div
                  key={embed.id}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedKey === embed.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleEdit(embed)}
                  data-testid={`social-embed-${embed.key}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{embed.key}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        embed.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {embed.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(embed.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                    {embed.html.substring(0, 60)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? `Edit: ${formKey}` : 'Create New Embed'}
          </h2>

          <div className="bg-white shadow-md rounded-lg p-6" data-testid="social-form">
            <div className="space-y-4">
              {/* Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key * {!isEditing && '(uppercase, numbers, underscores only)'}
                </label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value.toUpperCase())}
                  disabled={isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="LINKEDIN_WALL"
                  pattern="[A-Z0-9_]+"
                  data-testid="social-key-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing ? 'Key cannot be changed after creation' : 'Example: LINKEDIN_WALL, TWITTER_FEED'}
                </p>
              </div>

              {/* HTML */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Code *
                </label>
                <textarea
                  value={formHtml}
                  onChange={(e) => setFormHtml(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="<iframe src='...' />"
                  data-testid="social-html-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste embed code from LinkedIn, Twitter, etc. Automatically sanitized for security.
                </p>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid="social-enabled-checkbox"
                />
                <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enabled (show on site)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    data-testid="social-save"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  {selectedKey && (
                    <button
                      onClick={handleNew}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {selectedKey && (
                  <button
                    onClick={() => handleDelete(selectedKey)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    data-testid="social-delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🔒 Security Notice</h3>
            <p className="text-sm text-yellow-800">
              All HTML is automatically sanitized before saving. Scripts and dangerous tags are removed.
              Only safe tags like <code className="bg-yellow-100 px-1">iframe</code>, <code className="bg-yellow-100 px-1">div</code>, and <code className="bg-yellow-100 px-1">a</code> are allowed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

