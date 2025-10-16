'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ExperienceImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  order: number;
  enabled: boolean;
  logoUrl?: string;
  images: ExperienceImage[];
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    order: 0,
    enabled: true,
    logoUrl: '',
  });
  const [imageData, setImageData] = useState({
    url: '',
    caption: '',
    order: 0,
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/admin/experiences');
      const data = await res.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch(`/api/admin/experiences/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setFormData({
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        order: 0,
        enabled: true,
        logoUrl: '',
      });
      setEditing(null);
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditing(exp.id);
    setFormData({
      company: exp.company,
      role: exp.role,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      description: exp.description,
      order: exp.order,
      enabled: exp.enabled,
      logoUrl: exp.logoUrl || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' });
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const handleToggle = async (exp: Experience) => {
    try {
      await fetch(`/api/admin/experiences/${exp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !exp.enabled }),
      });
      fetchExperiences();
    } catch (error) {
      console.error('Error toggling experience:', error);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showImageModal) return;

    try {
      await fetch(`/api/admin/experiences/${showImageModal}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageData),
      });
      setImageData({ url: '', caption: '', order: 0 });
      setShowImageModal(null);
      fetchExperiences();
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  const handleDeleteImage = async (expId: string, imageId: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await fetch(`/api/admin/experiences/${expId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Professional Experiences</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editing ? 'Edit Experience' : 'Add New Experience'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role/Title *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="2019"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="2023 or leave empty for Present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="/images/experience/company-logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2 h-32"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Enabled</label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setFormData({
                    company: '',
                    role: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    order: 0,
                    enabled: true,
                    logoUrl: '',
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {exp.logoUrl && (
                  <Image
                    src={exp.logoUrl}
                    alt={exp.company}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{exp.company}</h3>
                  <p className="text-gray-600">{exp.role}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(exp)}
                  className={`px-3 py-1 text-sm rounded ${
                    exp.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {exp.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleEdit(exp)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{exp.description}</p>

            {/* Images */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Images ({exp.images.length})</h4>
                <button
                  onClick={() => setShowImageModal(exp.id)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  + Add Image
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {exp.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <Image
                      src={img.url}
                      alt={img.caption || ''}
                      width={200}
                      height={150}
                      className="rounded object-cover w-full h-32"
                    />
                    {img.caption && (
                      <p className="text-xs text-gray-600 mt-1">{img.caption}</p>
                    )}
                    <button
                      onClick={() => handleDeleteImage(exp.id, img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Image</h3>
            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={imageData.url}
                  onChange={(e) => setImageData({ ...imageData, url: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="/images/landmarks/office.jpg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <input
                  type="text"
                  value={imageData.caption}
                  onChange={(e) => setImageData({ ...imageData, caption: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Company headquarters in NYC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <input
                  type="number"
                  value={imageData.order}
                  onChange={(e) => setImageData({ ...imageData, order: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(null);
                    setImageData({ url: '', caption: '', order: 0 });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

