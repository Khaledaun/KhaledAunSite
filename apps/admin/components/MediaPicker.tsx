'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Media {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface MediaPickerProps {
  onSelect: (media: Media) => void;
  onClose: () => void;
  filterType?: 'image' | 'video' | 'all';
}

export function MediaPicker({ onSelect, onClose, filterType = 'all' }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const fetchMedia = async () => {
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
  };

  const filteredMedia = media.filter((m) => {
    if (filterType === 'image' && !m.mimeType.startsWith('image/')) return false;
    if (filterType === 'video' && !m.mimeType.startsWith('video/')) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Media</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchMedia();
              }}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading media...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No media found</p>
              <button
                onClick={onClose}
                className="mt-4 text-blue-500 hover:underline"
              >
                Go to Media Library to upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg group"
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
                          Select
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
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaPicker;



