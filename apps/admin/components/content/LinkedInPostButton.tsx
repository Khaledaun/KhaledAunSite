'use client';

import { useState } from 'react';
import { Linkedin, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface LinkedInPostButtonProps {
  contentId: string;
  title: string;
  content: string;
  excerpt?: string;
  url?: string;
  imageUrl?: string;
  onSuccess?: (permalink: string) => void;
  onError?: (error: string) => void;
}

export function LinkedInPostButton({
  contentId,
  title,
  content,
  excerpt,
  url,
  imageUrl,
  onSuccess,
  onError,
}: LinkedInPostButtonProps) {
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    permalink?: string;
    error?: string;
  } | null>(null);

  const handlePost = async () => {
    if (!confirm('Post this content to LinkedIn now?')) {
      return;
    }

    setPosting(true);
    setResult(null);

    try {
      // Prepare post text (use excerpt if available, otherwise truncate content)
      const postText = excerpt || stripHtml(content).slice(0, 1000);
      const fullText = `${title}\n\n${postText}`;

      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          text: fullText,
          url,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          permalink: data.permalink,
        });
        onSuccess?.(data.permalink);
      } else {
        const errorMsg = data.details || data.error || 'Failed to post';
        setResult({
          success: false,
          error: errorMsg,
        });
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        error: errorMsg,
      });
      onError?.(errorMsg);
    } finally {
      setPosting(false);
    }
  };

  // Strip HTML tags from content
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-3">
      {/* Post Button */}
      <button
        type="button"
        onClick={handlePost}
        disabled={posting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Linkedin className="h-5 w-5" />
        {posting ? 'Posting...' : 'Post to LinkedIn Now'}
      </button>

      {/* Result Message */}
      {result && (
        <div
          className={`p-3 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {result.success ? (
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Posted successfully! 🎉
                  </p>
                  {result.permalink && (
                    <a
                      href={result.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
                    >
                      View on LinkedIn
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Posting failed
                  </p>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Post will use the title, excerpt (or truncated content), and any featured image.
      </p>
    </div>
  );
}

