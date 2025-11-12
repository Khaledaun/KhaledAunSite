'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface Media {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  altText?: string;
  caption?: string;
  tags: string[];
  folder: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    try {
      const response = await fetch('/api/media-library');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      setMedia(data.media || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'uploads');

        const response = await fetch('/api/media-library/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const { media: newMedia } = await response.json();
        setMedia((prev) => [newMedia, ...prev]);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  async function deleteMedia(id: string) {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/media-library/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete media');
      
      setMedia((prev) => prev.filter((m) => m.id !== id));
      setSelectedMedia(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage images, videos, and documents
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-sm font-medium text-gray-900">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-500">
            or click to browse (Images, Videos, PDFs • Max 10MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Files</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {media.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Images</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">
            {media.filter(m => m.mimeType.startsWith('image/')).length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Videos</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-purple-600">
            {media.filter(m => m.mimeType.startsWith('video/')).length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Documents</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            {media.filter(m => m.mimeType === 'application/pdf').length}
          </dd>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="rounded-lg bg-white shadow">
        {media.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">No media uploaded yet. Drop files above to get started.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="aspect-square">
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.altText || item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : item.mimeType.startsWith('video/') ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
                      <span className="text-4xl">🎥</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <span className="text-4xl">📄</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="truncate text-xs font-medium text-white">{item.originalFilename}</p>
                  <p className="text-xs text-gray-300">{formatFileSize(item.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="flex cursor-pointer items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.altText || item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : item.mimeType.startsWith('video/') ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
                      <span className="text-2xl">🎥</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.originalFilename}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(item.fileSize)} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMedia(item.id);
                  }}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Media Details</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Preview */}
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {selectedMedia.mimeType.startsWith('image/') ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altText || selectedMedia.filename}
                    className="w-full"
                  />
                ) : selectedMedia.mimeType.startsWith('video/') ? (
                  <video src={selectedMedia.url} controls className="w-full" />
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <span className="text-6xl">📄</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-700">Filename</dt>
                  <dd className="text-gray-900">{selectedMedia.originalFilename}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">File Size</dt>
                  <dd className="text-gray-900">{formatFileSize(selectedMedia.fileSize)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Type</dt>
                  <dd className="text-gray-900">{selectedMedia.mimeType}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Uploaded</dt>
                  <dd className="text-gray-900">{new Date(selectedMedia.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">URL</dt>
                  <dd className="break-all text-blue-600">
                    <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer">
                      {selectedMedia.url}
                    </a>
                  </dd>
                </div>
              </dl>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  Open
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMedia.url);
                    alert('URL copied to clipboard!');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => deleteMedia(selectedMedia.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
