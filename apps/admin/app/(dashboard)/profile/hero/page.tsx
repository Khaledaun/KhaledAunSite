'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeroTitle {
  id: string;
  title: string;
  language: string;
  order: number;
  active: boolean;
}

interface Credential {
  text: string;
  order: number;
}

export default function ProfileHeroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hero Titles
  const [heroTitles, setHeroTitles] = useState<HeroTitle[]>([]);
  const [newTitle, setNewTitle] = useState({ title: '', language: 'en', order: 0 });

  // Bio
  const [bioEn, setBioEn] = useState('');
  const [bioAr, setBioAr] = useState('');

  // Professional Addresses
  const [addressEn, setAddressEn] = useState('');
  const [addressAr, setAddressAr] = useState('');

  // Credentials
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch hero titles
      const titlesRes = await fetch('/api/admin/hero-titles');
      if (titlesRes.ok) {
        const data = await titlesRes.json();
        setHeroTitles(data.titles);
      }

      // TODO: Fetch bio, addresses, credentials from a profile API
      // For now, we'll use placeholder values
      
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const addHeroTitle = async () => {
    if (!newTitle.title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/admin/hero-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTitle),
      });

      if (!response.ok) throw new Error('Failed to add title');

      setNewTitle({ title: '', language: 'en', order: 0 });
      fetchData();
      setSuccess('Title added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteHeroTitle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this title?')) return;

    try {
      const response = await fetch(`/api/admin/hero-titles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete title');

      fetchData();
      setSuccess('Title deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addCredential = () => {
    if (!newCredential.trim()) return;

    setCredentials([
      ...credentials,
      { text: newCredential, order: credentials.length },
    ]);
    setNewCredential('');
  };

  const removeCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError('');

      // TODO: Save bio, addresses, credentials to API
      // For now, just show success
      
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hero & Bio</h1>
        <p className="mt-2 text-gray-600">
          Manage your professional presence, hero titles, bio, and credentials
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Hero Titles */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hero Titles</h2>
          <p className="text-sm text-gray-600 mb-4">
            Dynamic titles that rotate in the hero section
          </p>

          <div className="space-y-4">
            {heroTitles.map((title) => (
              <div
                key={title.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div className="flex-1">
                  <span className="font-medium">{title.title}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    ({title.language.toUpperCase()})
                  </span>
                </div>
                <button
                  onClick={() => deleteHeroTitle(title.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newTitle.title}
              onChange={(e) => setNewTitle({ ...newTitle, title: e.target.value })}
              placeholder="New title..."
              className="col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={newTitle.language}
                onChange={(e) => setNewTitle({ ...newTitle, language: e.target.value })}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">EN</option>
                <option value="ar">AR</option>
              </select>
              <button
                onClick={addHeroTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Professional Bio</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your professional biography for the About page
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Bio
              </label>
              <textarea
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your professional bio in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arabic Bio (Optional)
              </label>
              <textarea
                value={bioAr}
                onChange={(e) => setBioAr(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اكتب سيرتك الذاتية المهنية بالعربية..."
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Professional Addresses */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Professional Address</h2>
          <p className="text-sm text-gray-600 mb-4">
            Office locations and contact addresses
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Address
              </label>
              <textarea
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Office address in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arabic Address (Optional)
              </label>
              <textarea
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="عنوان المكتب بالعربية..."
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Credentials & Qualifications</h2>
          <p className="text-sm text-gray-600 mb-4">
            Professional credentials, certifications, and qualifications (free-text list)
          </p>

          <div className="space-y-3">
            {credentials.map((cred, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <span>{cred.text}</span>
                <button
                  onClick={() => removeCredential(index)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newCredential}
              onChange={(e) => setNewCredential(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCredential()}
              placeholder="Add a credential (e.g., LL.M. International Law, Harvard 2015)..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addCredential}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

