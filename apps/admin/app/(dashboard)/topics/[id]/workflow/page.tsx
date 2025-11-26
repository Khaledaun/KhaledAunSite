'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Send,
  Eye,
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: string;
  keywords: string[];
  metadata: any;
}

export default function TopicWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showArticle, setShowArticle] = useState<'en' | 'ar' | null>(null);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      setTopic(data.topic);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!confirm('Generate comprehensive content prompts for this topic?')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/workflow/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!response.ok) throw new Error('Failed to generate prompts');

      const data = await response.json();
      setTopic(data.topic);
      alert('Prompts generated successfully! Review and approve them.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate prompts');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprovePrompt = async () => {
    if (!confirm('Approve these prompts and proceed to article generation?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'prompt_approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve prompt');

      await fetchTopic();
      alert('Prompts approved!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve prompt');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!confirm('Generate bilingual articles? This may take 1-2 minutes.')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/workflow/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          mediaIds: selectedMedia,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate articles');

      await fetchTopic();
      alert('Articles generated successfully! Review them below.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate articles');
    } finally {
      setProcessing(false);
    }
  };

  const getStepStatus = (step: string) => {
    if (!topic) return 'pending';

    const statusFlow = [
      'topic_created',
      'prompt_ready',
      'prompt_approved',
      'article_ready',
      'article_approved',
      'published',
      'linkedin_ready',
      'linkedin_approved',
      'completed',
    ];

    const currentIndex = statusFlow.indexOf(topic.status);
    const stepIndex = statusFlow.indexOf(step);

    if (currentIndex === stepIndex) return 'current';
    if (currentIndex > stepIndex) return 'completed';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!topic) {
    return <div className="p-6 text-center">Topic not found</div>;
  }

  const metadata = topic.metadata || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Content Production Workflow</p>
        </div>
        <button
          onClick={() => router.push('/topics')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Topics
        </button>
      </div>

      {/* Workflow Steps */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-6">
          {/* Step 1: Generate Prompt */}
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getStepStatus('prompt_ready') === 'completed' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : getStepStatus('prompt_ready') === 'current' ? (
                <Clock className="h-6 w-6 text-blue-600" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">1. Generate Content Prompts</h3>
              <p className="mt-1 text-sm text-gray-600">
                Create comprehensive prompts with SEO, GEO, and AIO optimization
              </p>

              {topic.status === 'topic_created' && (
                <button
                  onClick={handleGeneratePrompt}
                  disabled={processing}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Generate Prompts
                </button>
              )}

              {(topic.status === 'prompt_ready' || topic.status === 'prompt_approved') &&
                metadata.promptEn && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => setShowPrompt(!showPrompt)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      {showPrompt ? 'Hide' : 'View'} Prompts
                    </button>

                    {showPrompt && (
                      <div className="rounded-lg border bg-gray-50 p-4 text-sm">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900">English Prompt:</h4>
                          <p className="mt-1 whitespace-pre-wrap text-gray-700">
                            {metadata.promptEn.substring(0, 500)}...
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Arabic Prompt:</h4>
                          <p className="mt-1 whitespace-pre-wrap text-gray-700" dir="rtl">
                            {metadata.promptAr.substring(0, 500)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {topic.status === 'prompt_ready' && (
                      <button
                        onClick={handleApprovePrompt}
                        disabled={processing}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Prompts
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Step 2: Select Media */}
          {topic.status === 'prompt_approved' && (
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">2. Select Article Images (Optional)</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Upload and select images to include in the article
                </p>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Media ID (comma-separated)"
                    value={selectedMedia.join(',')}
                    onChange={(e) =>
                      setSelectedMedia(e.target.value.split(',').filter(Boolean))
                    }
                    className="rounded-md border px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Go to /media page to upload images, then paste their IDs here
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generate Articles */}
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getStepStatus('article_ready') === 'completed' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : getStepStatus('article_ready') === 'current' ? (
                <Clock className="h-6 w-6 text-blue-600" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">3. Generate Articles</h3>
              <p className="mt-1 text-sm text-gray-600">
                Generate bilingual articles (English & Arabic)
              </p>

              {topic.status === 'prompt_approved' && (
                <button
                  onClick={handleGenerateArticle}
                  disabled={processing}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Generate Articles
                </button>
              )}

              {topic.status === 'article_ready' && metadata.articleEnId && (
                <div className="mt-3 flex gap-2">
                  <a
                    href={`/content/${metadata.articleEnId}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View English Article →
                  </a>
                  <a
                    href={`/content/${metadata.articleArId}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Arabic Article →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* More steps will be added: Publishing, LinkedIn generation, etc. */}
        </div>
      </div>

      {/* Status Footer */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Current Status: {topic.status.replace(/_/g, ' ').toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-blue-700">
              Complete each step to proceed with the content production workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
