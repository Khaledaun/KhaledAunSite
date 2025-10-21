'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface Media {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  folder: string | null;
  tags: string[];
  createdAt: string;
  uploader: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MediaDetailProps {
  media: Media;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Media>) => void;
}

function MediaDetailModal({ media, onClose, onDelete, onUpdate }: MediaDetailProps) {
  const [altText, setAltText] = useState(media.alt || '');
  const [caption, setCaption] = useState(media.caption || '');
  const [tags, setTags] = useState(media.tags.join(', '));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt: altText,
          caption,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(media.id, data.media);
        alert('Media updated successfully');
      } else {
        alert('Failed to update media');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(media.id);
        alert('Media deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete media');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(media.url);
    alert('URL copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Media Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              {media.mimeType.startsWith('image/') ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={media.url}
                    alt={media.alt || media.originalName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-6xl">📄</span>
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Filename:</strong> {media.originalName}</p>
                <p><strong>Type:</strong> {media.mimeType}</p>
                <p><strong>Size:</strong> {(media.size / 1024).toFixed(2)} KB</p>
                {media.width && media.height && (
                  <p><strong>Dimensions:</strong> {media.width} × {media.height}px</p>
                )}
                <p><strong>Uploaded:</strong> {new Date(media.createdAt).toLocaleDateString()}</p>
                <p><strong>By:</strong> {media.uploader.name || media.uploader.email}</p>
              </div>

              <button
                onClick={copyUrl}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📋 Copy URL
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alt Text (for accessibility)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Describe the image..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Optional caption..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="blog, featured, hero"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  <strong>Public URL:</strong>
                  <br />
                  <code className="bg-gray-100 p-1 rounded text-xs break-all">
                    {media.url}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'pdf'>('all');

  // Fetch media
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/media/upload?${params}`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, searchTerm]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads');

      try {
        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setMedia((prev) => [data.media, ...prev]);
        } else {
          const error = await response.json();
          alert(`Upload failed: ${error.error}`);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed');
      }
    }

    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpdate = (id: string, updatedMedia: Partial<Media>) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedMedia } : m))
    );
    setSelectedMedia(null);
  };

  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setSelectedMedia(null);
  };

  const filteredMedia = media;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage images, videos, and files
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-gray-600">
          {uploading ? (
            <p className="text-lg">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-lg">Drop files here...</p>
          ) : (
            <>
              <p className="text-lg mb-2">
                📤 Drag & drop files here, or click to select
              </p>
              <p className="text-sm">
                Supports: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM), PDFs up to 50MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search media..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="pdf">PDFs</option>
        </select>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading media...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No media found. Upload some files to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg group"
              onClick={() => setSelectedMedia(item)}
            >
              {item.mimeType.startsWith('image/') ? (
                <>
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.alt || item.originalName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm">
                      View Details
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
                  <span className="text-4xl mb-2">
                    {item.mimeType.startsWith('video/') ? '🎥' : '📄'}
                  </span>
                  <span className="text-xs text-center truncate w-full">
                    {item.originalName}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}



