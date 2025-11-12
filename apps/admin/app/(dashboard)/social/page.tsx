'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Linkedin, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface LinkedInAccount {
  id: string;
  provider: string;
  accountId: string;
  accountName: string | null;
  tokenExpiresAt: string | null;
  isExpired: boolean;
  connectionValid: boolean;
  scopes: string[];
  metadata: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConnectionStatus {
  connected: boolean;
  account: LinkedInAccount | null;
}

function SocialPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Check for OAuth callback messages
  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');
    const details = searchParams?.get('details');

    if (success === 'linkedin_connected') {
      setMessage({
        type: 'success',
        text: 'LinkedIn account connected successfully! 🎉',
      });
      // Clear URL params
      window.history.replaceState({}, '', '/social');
    } else if (error) {
      setMessage({
        type: 'error',
        text: `Connection failed: ${details || error}`,
      });
      // Clear URL params
      window.history.replaceState({}, '', '/social');
    }
  }, [searchParams]);

  // Fetch connection status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/linkedin/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = '/api/auth/linkedin/connect';
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your LinkedIn account?')) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch('/api/auth/linkedin/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'LinkedIn account disconnected successfully',
        });
        setStatus({ connected: false, account: null });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.details || 'Failed to disconnect account',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while disconnecting',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefresh = () => {
    setMessage(null);
    fetchStatus();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Social Accounts
        </h1>
        <p className="text-gray-600">
          Connect and manage your social media accounts for publishing content.
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {message.type === 'error' && <XCircle className="h-5 w-5" />}
              {message.type === 'info' && <AlertCircle className="h-5 w-5" />}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* LinkedIn Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">LinkedIn</h2>
                <p className="text-sm text-gray-500">Share professional content</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Loading connection status...
            </div>
          ) : status?.connected && status.account ? (
            <div>
              {/* Connected Status */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Connected</span>
                </div>
                <div className="text-sm text-green-700">
                  Signed in as {status.account.metadata.firstName}{' '}
                  {status.account.metadata.lastName}
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-mono text-gray-900">
                    {status.account.accountId}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connected:</span>
                  <span className="text-gray-900">
                    {new Date(status.account.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Token Expires:</span>
                  <span
                    className={
                      status.account.isExpired
                        ? 'text-red-600 font-medium'
                        : 'text-gray-900'
                    }
                  >
                    {status.account.tokenExpiresAt ? new Date(status.account.tokenExpiresAt).toLocaleString() : 'Never'}
                    {status.account.isExpired && ' (Expired)'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="text-gray-900">
                    {status.account.scopes.join(', ')}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={
                      status.account.connectionValid
                        ? 'text-green-600 font-medium'
                        : 'text-orange-600 font-medium'
                    }
                  >
                    {status.account.connectionValid ? 'Active' : 'Needs Refresh'}
                  </span>
                </div>
              </div>

              {/* Warning for Expired */}
              {status.account.isExpired && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      Token Expired
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Your LinkedIn access token has expired. Reconnect to continue
                    posting.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {status.account.isExpired ? (
                  <button
                    onClick={handleConnect}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reconnect LinkedIn
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Not Connected */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Not Connected</span>
                </div>
                <p className="text-sm text-gray-600">
                  Connect your LinkedIn account to start publishing content directly
                  from the CMS.
                </p>
              </div>

              {/* Features List */}
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  What you can do:
                </p>
                <div className="space-y-2">
                  {[
                    'Post articles and updates instantly',
                    'Schedule posts for optimal timing',
                    'Share content with images and links',
                    'Track publishing status and errors',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Connect LinkedIn Account
              </button>

              {/* Setup Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">First time setup?</p>
                    <p className="text-blue-700">
                      Make sure your LinkedIn app credentials are configured in
                      environment variables. See{' '}
                      <code className="bg-blue-100 px-1 rounded">
                        docs/Sprint4-Auth-LinkedIn.md
                      </code>{' '}
                      for setup instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon: Other Platforms */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Share visual content and stories with your audience.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-400 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Twitter / X</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Share quick updates and engage in real-time conversations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SocialPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Accounts</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SocialPageContent />
    </Suspense>
  );
}
