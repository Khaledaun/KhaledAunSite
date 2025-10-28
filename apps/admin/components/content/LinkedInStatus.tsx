'use client';

import { useEffect, useState } from 'react';
import { Linkedin, ExternalLink, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface LinkedInStatusProps {
  contentId: string;
}

interface PublishStatus {
  status: 'draft' | 'queued' | 'posting' | 'posted' | 'failed';
  publishedLinks?: { linkedin?: string };
  lastPublishAttempt?: string;
  lastPublishError?: string;
  publishAttempts?: number;
  scheduledFor?: string;
}

export function LinkedInStatus({ contentId }: LinkedInStatusProps) {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [contentId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/content-library/${contentId}`);
      if (response.ok) {
        const { content } = await response.json();
        setStatus({
          status: content.publishStatus || 'draft',
          publishedLinks: content.publishedLinks || {},
          lastPublishAttempt: content.lastPublishAttempt,
          lastPublishError: content.lastPublishError,
          publishAttempts: content.publishAttempts || 0,
          scheduledFor: content.scheduledFor,
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Loading status...
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusColor = (stat: string) => {
    switch (stat) {
      case 'posted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'posting':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'queued':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (stat: string) => {
    switch (stat) {
      case 'posted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'posting':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Linkedin className="h-5 w-5 text-gray-400" />;
    }
  };

  const linkedInUrl = status.publishedLinks?.linkedin;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">LinkedIn Status</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Current Status */}
        <div className={`p-3 rounded-lg border ${getStatusColor(status.status)}`}>
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(status.status)}
            <span className="font-medium capitalize">{status.status}</span>
          </div>
          {status.status === 'posted' && linkedInUrl && (
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 mt-2 hover:underline"
            >
              View on LinkedIn
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Scheduled */}
        {status.scheduledFor && status.status !== 'posted' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Scheduled
              </span>
            </div>
            <p className="text-sm text-yellow-700">
              {new Date(status.scheduledFor).toLocaleString()}
            </p>
          </div>
        )}

        {/* Error Message */}
        {status.lastPublishError && status.status === 'failed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Last Error
                </p>
                <p className="text-sm text-red-700 break-words">
                  {status.lastPublishError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Publish History */}
        {status.publishAttempts && status.publishAttempts > 0 && (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Attempts:</span>
              <span className="font-medium">{status.publishAttempts}</span>
            </div>
            {status.lastPublishAttempt && (
              <div className="flex justify-between">
                <span>Last Attempt:</span>
                <span className="font-medium">
                  {new Date(status.lastPublishAttempt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* No Activity */}
        {status.status === 'draft' && status.publishAttempts === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            Not yet published to LinkedIn
          </p>
        )}
      </div>
    </div>
  );
}

