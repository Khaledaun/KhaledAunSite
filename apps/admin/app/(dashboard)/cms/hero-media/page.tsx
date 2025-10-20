'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  imageUrl?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'selfhosted';
  enabled: boolean;
  autoplay: boolean;
}

export default function HeroMediaPage() {
  const [media, setMedia] = useState<HeroMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    imageUrl: '',
    videoUrl: '',
    videoType: 'youtube' as 'youtube' | 'vimeo' | 'selfhosted',
    autoplay: false,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/hero-media');
      const data = await res.json();
      if (data.media) {
        setMedia(data.media);
        setFormData({
          type: data.media.type,
          imageUrl: data.media.imageUrl || '',
          videoUrl: data.media.videoUrl || '',
          videoType: data.media.videoType || 'youtube',
          autoplay: data.media.autoplay || false,
        });
      }
    } catch (error) {
      console.error('Error fetching hero media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/hero-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      fetchMedia();
      alert('Hero media updated successfully!');
    } catch (error) {
      console.error('Error saving hero media:', error);
      alert('Failed to update hero media');
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    return match ? match[1] : null;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Hero Media Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Media Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="IMAGE"
                  checked={formData.type === 'IMAGE'}
                  onChange={(e) => setFormData({ ...formData, type: 'IMAGE' })}
                  className="mr-2"
                />
                <span className="text-sm">Image</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="VIDEO"
                  checked={formData.type === 'VIDEO'}
                  onChange={(e) => setFormData({ ...formData, type: 'VIDEO' })}
                  className="mr-2"
                />
                <span className="text-sm">Video</span>
              </label>
            </div>
          </div>

          {/* Image Settings */}
          {formData.type === 'IMAGE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="/images/hero/khaled-portrait.jpg"
                  required={formData.type === 'IMAGE'}
                />
              </div>
              {formData.imageUrl && (
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <Image
                    src={formData.imageUrl}
                    alt="Hero preview"
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Video Settings */}
          {formData.type === 'VIDEO' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Source</label>
                <select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="selfhosted">Self-Hosted (MP4)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.videoType === 'youtube' && 'YouTube URL *'}
                  {formData.videoType === 'vimeo' && 'Vimeo URL *'}
                  {formData.videoType === 'selfhosted' && 'Video File URL *'}
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={
                    formData.videoType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : formData.videoType === 'vimeo'
                      ? 'https://vimeo.com/...'
                      : '/videos/hero-video.mp4'
                  }
                  required={formData.type === 'VIDEO'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.videoType === 'youtube' && 'Full YouTube URL or share link'}
                  {formData.videoType === 'vimeo' && 'Full Vimeo URL'}
                  {formData.videoType === 'selfhosted' && 'Path to your MP4 video file'}
                </p>
              </div>

              {/* Video Preview */}
              {formData.videoUrl && (
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  {formData.videoType === 'youtube' && extractYouTubeId(formData.videoUrl) && (
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(formData.videoUrl)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      ></iframe>
                    </div>
                  )}
                  {formData.videoType === 'vimeo' && extractVimeoId(formData.videoUrl) && (
                    <div className="aspect-video">
                      <iframe
                        src={`https://player.vimeo.com/video/${extractVimeoId(formData.videoUrl)}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      ></iframe>
                    </div>
                  )}
                  {formData.videoType === 'selfhosted' && (
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full rounded"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoplay}
                  onChange={(e) => setFormData({ ...formData, autoplay: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">
                  Autoplay video (muted, background)
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save Hero Media Settings
            </button>
          </div>
        </form>
      </div>

      {/* Current Settings Display */}
      {media && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Current Active Settings</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Type:</span>{' '}
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {media.type}
              </span>
            </p>
            {media.type === 'IMAGE' && media.imageUrl && (
              <p>
                <span className="font-medium">Image:</span> {media.imageUrl}
              </p>
            )}
            {media.type === 'VIDEO' && (
              <>
                <p>
                  <span className="font-medium">Video Type:</span> {media.videoType}
                </p>
                <p>
                  <span className="font-medium">Video URL:</span> {media.videoUrl}
                </p>
                <p>
                  <span className="font-medium">Autoplay:</span>{' '}
                  {media.autoplay ? 'Yes' : 'No'}
                </p>
              </>
            )}
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={`px-2 py-1 rounded ${media.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {media.enabled ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

