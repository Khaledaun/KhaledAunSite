'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostForm, { PostFormData } from '@/components/PostForm';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  author: {
    name: string | null;
    email: string;
  };
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/posts/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PostFormData) => {
    const response = await fetch(`/api/admin/posts/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    // Refresh the post data
    await fetchPost();
    alert('Post updated successfully!');
  };

  const handleCancel = () => {
    router.push('/posts');
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${params.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }

      await fetchPost();
      alert('Post published successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish post');
    }
  };

  const handlePreview = async () => {
    try {
      // Get signed preview URL from API
      const response = await fetch(`/api/admin/posts/${params.id}/preview-url`);
      
      if (!response.ok) throw new Error('Failed to generate preview URL');
      
      const data = await response.json();
      
      // Open in new window
      window.open(data.previewUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate preview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error: {error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/posts')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Post</h1>
            <p className="text-gray-600 mt-1">
              Status: <span className={`font-semibold ${post.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}`}>
                {post.status}
              </span>
            </p>
          </div>
          <div className="space-x-2">
            {post.status === 'DRAFT' && (
              <>
                <button
                  onClick={handlePreview}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Preview Draft
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Publish
                </button>
              </>
            )}
            {post.status === 'PUBLISHED' && (
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/en/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Published
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <PostForm
          post={post}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Post"
        />
      </div>
    </div>
  );
}

