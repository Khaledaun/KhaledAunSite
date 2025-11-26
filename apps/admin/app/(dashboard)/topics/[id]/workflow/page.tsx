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
  Globe,
  Linkedin,
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
  const [showLinkedIn, setShowLinkedIn] = useState(false);

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

      await fetchTopic();
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
      alert('Articles generated successfully! Review them.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate articles');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveArticles = async () => {
    if (!confirm('Approve these articles for publishing?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'article_approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve articles');

      await fetchTopic();
      alert('Articles approved!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve articles');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublishArticles = async () => {
    if (!confirm('Publish articles to the public website? This will notify Google.')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/workflow/publish-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!response.ok) throw new Error('Failed to publish articles');

      const data = await response.json();
      await fetchTopic();
      alert(`Articles published!\nEN: ${data.urls.en}\nAR: ${data.urls.ar}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to publish articles');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateLinkedIn = async () => {
    if (!confirm('Generate LinkedIn posts from published articles?')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/workflow/generate-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!response.ok) throw new Error('Failed to generate LinkedIn posts');

      await fetchTopic();
      alert('LinkedIn posts generated! Review them below.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate LinkedIn posts');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveLinkedIn = async () => {
    if (!confirm('Approve these LinkedIn posts for publishing?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'linkedin_approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve LinkedIn posts');

      await fetchTopic();
      alert('LinkedIn posts approved!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve LinkedIn posts');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublishLinkedIn = async (language: 'en' | 'ar') => {
    if (!confirm(`Publish ${language.toUpperCase()} LinkedIn post?`)) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/workflow/publish-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, language }),
      });

      if (!response.ok) throw new Error('Failed to publish LinkedIn post');

      const data = await response.json();
      await fetchTopic();

      if (data.warning) {
        alert(`${data.warning}\n${data.error || ''}`);
      } else {
        alert(`LinkedIn post published!\nURL: ${data.linkedinUrl}`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to publish LinkedIn post');
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
      'linkedin_published',
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
          <p className="mt-1 text-sm text-gray-500">AI-Powered Content Production Workflow</p>
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
        <div className="space-y-8">
          {/* Step 1: Generate Prompt */}
          <WorkflowStep
            number="1"
            title="Generate Content Prompts"
            description="Create comprehensive prompts with SEO, GEO, and AIO optimization"
            status={getStepStatus('prompt_ready')}
            action={
              topic.status === 'topic_created' && (
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
              )
            }
          >
            {(topic.status === 'prompt_ready' || getStepStatus('prompt_ready') === 'completed') &&
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
                        <h4 className="font-medium text-gray-900">English Prompt (preview):</h4>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700">
                          {metadata.promptEn.substring(0, 400)}...
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Arabic Prompt (preview):</h4>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700" dir="rtl">
                          {metadata.promptAr?.substring(0, 400)}...
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
          </WorkflowStep>

          {/* Step 2: Select Media */}
          {topic.status === 'prompt_approved' && (
            <WorkflowStep
              number="2"
              title="Select Article Images (Optional)"
              description="Upload and select images to include in the article"
              status="current"
            >
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Media IDs (comma-separated)"
                  value={selectedMedia.join(',')}
                  onChange={(e) => setSelectedMedia(e.target.value.split(',').filter(Boolean))}
                  className="rounded-md border px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Go to <a href="/media" className="text-blue-600 hover:underline">/media</a> page
                  to upload images, then paste their IDs here
                </p>
              </div>
            </WorkflowStep>
          )}

          {/* Step 3: Generate Articles */}
          <WorkflowStep
            number="3"
            title="Generate Bilingual Articles"
            description="Generate articles in both English and Arabic"
            status={getStepStatus('article_ready')}
            action={
              topic.status === 'prompt_approved' && (
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
                  Generate Articles (1-2 min)
                </button>
              )
            }
          >
            {topic.status === 'article_ready' && metadata.articleEnId && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-3">
                  <a
                    href={`/content/${metadata.articleEnId}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    📄 View English Article →
                  </a>
                  <a
                    href={`/content/${metadata.articleArId}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    📄 View Arabic Article →
                  </a>
                </div>
                <button
                  onClick={handleApproveArticles}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Articles
                </button>
              </div>
            )}
          </WorkflowStep>

          {/* Step 4: Publish Articles */}
          <WorkflowStep
            number="4"
            title="Publish to Website"
            description="Publish articles to public website and notify Google"
            status={getStepStatus('published')}
            action={
              topic.status === 'article_approved' && (
                <button
                  onClick={handlePublishArticles}
                  disabled={processing}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Publish Articles
                </button>
              )
            }
          >
            {topic.status === 'published' && metadata.enUrl && (
              <div className="mt-3 space-y-1">
                <a
                  href={metadata.enUrl}
                  target="_blank"
                  className="block text-sm text-green-600 hover:underline"
                >
                  ✅ English: {metadata.enUrl}
                </a>
                <a
                  href={metadata.arUrl}
                  target="_blank"
                  className="block text-sm text-green-600 hover:underline"
                >
                  ✅ Arabic: {metadata.arUrl}
                </a>
              </div>
            )}
          </WorkflowStep>

          {/* Step 5: Generate LinkedIn Posts */}
          <WorkflowStep
            number="5"
            title="Generate LinkedIn Posts"
            description="Create engaging LinkedIn posts from published articles"
            status={getStepStatus('linkedin_ready')}
            action={
              topic.status === 'published' && (
                <button
                  onClick={handleGenerateLinkedIn}
                  disabled={processing}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Linkedin className="h-4 w-4" />
                  )}
                  Generate LinkedIn Posts
                </button>
              )
            }
          >
            {(topic.status === 'linkedin_ready' || getStepStatus('linkedin_ready') === 'completed') &&
              metadata.linkedinEn && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => setShowLinkedIn(!showLinkedIn)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    {showLinkedIn ? 'Hide' : 'View'} LinkedIn Posts
                  </button>

                  {showLinkedIn && (
                    <div className="space-y-4 rounded-lg border bg-gray-50 p-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900">English Post:</h4>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700">
                          {metadata.linkedinEn}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Arabic Post:</h4>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700" dir="rtl">
                          {metadata.linkedinAr}
                        </p>
                      </div>
                    </div>
                  )}

                  {topic.status === 'linkedin_ready' && (
                    <button
                      onClick={handleApproveLinkedIn}
                      disabled={processing}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve LinkedIn Posts
                    </button>
                  )}
                </div>
              )}
          </WorkflowStep>

          {/* Step 6: Publish to LinkedIn */}
          <WorkflowStep
            number="6"
            title="Publish to LinkedIn"
            description="Post to your LinkedIn profile and website's LinkedIn section"
            status={getStepStatus('linkedin_published')}
          >
            {topic.status === 'linkedin_approved' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handlePublishLinkedIn('en')}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish EN
                </button>
                <button
                  onClick={() => handlePublishLinkedIn('ar')}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish AR
                </button>
              </div>
            )}

            {topic.status === 'linkedin_published' && metadata.linkedinUrl && (
              <div className="mt-3">
                <a
                  href={metadata.linkedinUrl}
                  target="_blank"
                  className="text-sm text-green-600 hover:underline"
                >
                  ✅ LinkedIn Post Published: {metadata.linkedinUrl}
                </a>
              </div>
            )}
          </WorkflowStep>
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
              Complete each step to build your thought leadership content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for workflow steps
function WorkflowStep({
  number,
  title,
  description,
  status,
  action,
  children,
}: {
  number: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">
        {status === 'completed' ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : status === 'current' ? (
          <Clock className="h-6 w-6 text-blue-600" />
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">
          {number}. {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {action}
        {children}
      </div>
    </div>
  );
}
