'use client';

import { useRouter } from 'next/navigation';
import PostForm, { PostFormData } from '@/components/PostForm';

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (data: PostFormData) => {
    const response = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    const result = await response.json();
    
    // Redirect to the edit page
    router.push(`/posts/${result.post.id}`);
  };

  const handleCancel = () => {
    router.push('/posts');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-gray-600 mt-1">Write a new blog post (will be saved as draft)</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <PostForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          submitLabel="Create Draft"
        />
      </div>
    </div>
  );
}

