'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  thumbnail_url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size_bytes: number;
  mime_type: string;
  width: number;
  height: number;
  alt_text: string;
  caption: string;
  tags: string[];
  folder: string;
  created_at: string;
  used_in_content: string[];
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMedia();
  }, [filterType, filterFolder]);

  const loadMedia = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterFolder !== 'all') params.append('folder', filterFolder);

      const response = await fetch(`/api/media-library?${params.toString()}`);
      const data = await response.json();
      setMedia(data.media || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
      const response = await fetch(`/api/media-library/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        loadMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const getMediaIcon = (type: string) => {
    const Icon = {
      image: PhotoIcon,
      video: VideoCameraIcon,
      document: DocumentIcon,
      audio: DocumentIcon,
    }[type] || DocumentIcon;

    return <Icon className="h-12 w-12 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFolders = () => {
    const folders = new Set(media.map(m => m.folder));
    return Array.from(folders).sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-2 text-sm text-gray-600">
            {total} {total === 1 ? 'file' : 'files'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          Upload
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          {/* Folder Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder
            </label>
            <select
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All Folders</option>
              {getFolders().map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload images, videos, or documents to use in your content.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Files
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              {/* Media Preview */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48">
                    {getMediaIcon(item.type)}
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.original_filename}
                </h3>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.type}</span>
                  <span>{formatFileSize(item.size_bytes)}</span>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
                {item.used_in_content && item.used_in_content.length > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    Used in {item.used_in_content.length} {item.used_in_content.length === 1 ? 'piece' : 'pieces'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMedia(item);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMedia(item.id);
                  }}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadMedia();
          }}
        />
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdate={() => {
            setSelectedMedia(null);
            loadMedia();
          }}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    folder: 'uncategorized',
    altText: '',
    caption: '',
    tags: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('folder', formData.folder);
      uploadFormData.append('altText', formData.altText);
      uploadFormData.append('caption', formData.caption);
      uploadFormData.append('tags', formData.tags);

      const response = await fetch('/api/media-library/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Media</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-gold transition-colors"
            >
              {selectedFile ? (
                <div>
                  <PhotoIcon className="mx-auto h-12 w-12 text-brand-gold" />
                  <p className="mt-2 text-sm text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4, PDF up to 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,application/pdf"
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Folder
            </label>
            <input
              type="text"
              value={formData.folder}
              onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
              placeholder="uncategorized"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alt Text
            </label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              placeholder="Describe the image for accessibility"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="legal, infographic, brand"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Media Detail Modal Component
function MediaDetailModal({ 
  media, 
  onClose, 
  onUpdate 
}: { 
  media: MediaItem; 
  onClose: () => void; 
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    alt_text: media.alt_text || '',
    caption: media.caption || '',
    tags: media.tags?.join(', ') || '',
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/media-library/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt_text: formData.alt_text,
          caption: formData.caption,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Media Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {media.type === 'image' ? (
              <Image
                src={media.url}
                alt={media.alt_text || media.filename}
                width={600}
                height={400}
                className="object-contain max-h-96"
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <PhotoIcon className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filename</label>
              <p className="mt-1 text-sm text-gray-900">{media.original_filename}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-brand-gold hover:underline break-all"
              >
                {media.url}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{media.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Size</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(media.size_bytes / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {media.width && media.height && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <p className="mt-1 text-sm text-gray-900">{media.width} × {media.height}</p>
              </div>
            )}

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Caption</label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-brand-gold text-white rounded-md hover:bg-brand-gold/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {media.alt_text && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                    <p className="mt-1 text-sm text-gray-900">{media.alt_text}</p>
                  </div>
                )}

                {media.caption && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Caption</label>
                    <p className="mt-1 text-sm text-gray-900">{media.caption}</p>
                  </div>
                )}

                {media.tags && media.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {media.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="w-full px-4 py-2 bg-brand-gold text-white rounded-md hover:bg-brand-gold/90"
                >
                  Edit Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
