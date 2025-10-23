'use client';

import { useState, useEffect } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Logo {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  active: boolean;
  createdAt: string;
}

export default function LogoManagementPage() {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/admin/site-logo');
      if (response.ok) {
        const data = await response.json();
        setLogo(data.logo);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Upload to media library first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'IMAGE');
      formData.append('alt', 'Khaled Aun Logo');

      const uploadResponse = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      const uploadData = await uploadResponse.json();

      // Create logo record
      const logoResponse = await fetch('/api/admin/site-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.asset.url,
          alt: 'Khaled Aun',
          width: uploadData.asset.width,
          height: uploadData.asset.height,
        }),
      });

      if (logoResponse.ok) {
        const data = await logoResponse.json();
        setLogo(data.logo);
        setMessage('Logo uploaded successfully!');
      } else {
        throw new Error('Failed to save logo');
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setMessage(error.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!logo || !confirm('Are you sure you want to delete the logo?')) return;

    try {
      const response = await fetch(`/api/admin/site-logo/${logo.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogo(null);
        setMessage('Logo deleted successfully');
      } else {
        throw new Error('Failed to delete logo');
      }
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      setMessage(error.message || 'Failed to delete logo');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Logo</h1>
        <p className="text-gray-600">
          Upload and manage your site logo. The logo will appear in the navigation bar.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {logo ? (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Current Logo</h2>
              <div className="flex items-center space-x-6">
                <img 
                  src={logo.url} 
                  alt={logo.alt} 
                  className="max-h-24 w-auto border border-gray-200 rounded p-2"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {logo.width}x{logo.height}px
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Uploaded:</strong> {new Date(logo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold mb-3">Replace Logo</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Logo Uploaded</h3>
            <p className="text-gray-600 mb-6">
              Upload a logo to replace your site name with a custom image
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Recommended: PNG or SVG, max 2MB, transparent background
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

