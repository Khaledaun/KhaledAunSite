'use client';

import { useEffect, useState } from 'react';

interface HeroTitle {
  id: string;
  titleEn: string;
  titleAr: string;
  order: number;
  enabled: boolean;
}

export default function HeroTitlesPage() {
  const [titles, setTitles] = useState<HeroTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    order: 0,
    enabled: true,
  });

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      const res = await fetch('/api/admin/hero-titles');
      const data = await res.json();
      setTitles(data.titles || []);
    } catch (error) {
      console.error('Error fetching titles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch(`/api/admin/hero-titles/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/hero-titles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setFormData({ titleEn: '', titleAr: '', order: 0, enabled: true });
      setEditing(null);
      fetchTitles();
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };

  const handleEdit = (title: HeroTitle) => {
    setEditing(title.id);
    setFormData({
      titleEn: title.titleEn,
      titleAr: title.titleAr,
      order: title.order,
      enabled: title.enabled,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this title?')) return;
    try {
      await fetch(`/api/admin/hero-titles/${id}`, { method: 'DELETE' });
      fetchTitles();
    } catch (error) {
      console.error('Error deleting title:', error);
    }
  };

  const handleToggle = async (title: HeroTitle) => {
    try {
      await fetch(`/api/admin/hero-titles/${title.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !title.enabled }),
      });
      fetchTitles();
    } catch (error) {
      console.error('Error toggling title:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Hero Rotating Titles</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editing ? 'Edit Title' : 'Add New Title'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">English Title</label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Arabic Title</label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              className="w-full border rounded px-3 py-2"
              dir="rtl"
              required
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
                  setFormData({ titleEn: '', titleAr: '', order: 0, enabled: true });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">English</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arabic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {titles.map((title) => (
              <tr key={title.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{title.order}</td>
                <td className="px-6 py-4 text-sm">{title.titleEn}</td>
                <td className="px-6 py-4 text-sm" dir="rtl">{title.titleAr}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggle(title)}
                    className={`px-2 py-1 text-xs rounded ${
                      title.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {title.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(title)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(title.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

