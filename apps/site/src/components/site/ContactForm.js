'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const LEAD_INTERESTS = {
  COLLABORATION: 'Collaboration',
  SPEAKING: 'Speaking Engagement',
  REFERRAL: 'Referral',
  PRESS: 'Press Inquiry',
  GENERAL: 'General Inquiry'
};

export default function ContactForm() {
  const t = useTranslations('contact');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    country: '',
    interest: 'GENERAL',
    message: ''
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://admin.khaledaun.com/api/admin/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'CONTACT_FORM'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus({
        type: 'success',
        message: t('successMessage', { defaultValue: 'Thank you for your message! We will get back to you soon.' })
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        organization: '',
        country: '',
        interest: 'GENERAL',
        message: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: t('errorMessage', { defaultValue: 'Something went wrong. Please try again or email us directly.' })
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-navy mb-2">
          {t('name', { defaultValue: 'Name' })} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
          placeholder={t('namePlaceholder', { defaultValue: 'Your full name' })}
          disabled={isSubmitting}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-navy mb-2">
          {t('email', { defaultValue: 'Email' })} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
          placeholder={t('emailPlaceholder', { defaultValue: 'your.email@example.com' })}
          disabled={isSubmitting}
        />
      </div>

      {/* Organization & Country (Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-brand-navy mb-2">
            {t('organization', { defaultValue: 'Organization' })}
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            placeholder={t('organizationPlaceholder', { defaultValue: 'Company or institution' })}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-brand-navy mb-2">
            {t('country', { defaultValue: 'Country' })}
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            placeholder={t('countryPlaceholder', { defaultValue: 'Your country' })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Interest */}
      <div>
        <label htmlFor="interest" className="block text-sm font-medium text-brand-navy mb-2">
          {t('interest', { defaultValue: 'I am interested in' })} <span className="text-red-500">*</span>
        </label>
        <select
          id="interest"
          name="interest"
          required
          value={formData.interest}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
          disabled={isSubmitting}
        >
          {Object.entries(LEAD_INTERESTS).map(([value, label]) => (
            <option key={value} value={value}>
              {t(`interest${value}`, { defaultValue: label })}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-navy mb-2">
          {t('message', { defaultValue: 'Message' })} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all resize-y"
          placeholder={t('messagePlaceholder', { defaultValue: 'Please describe your inquiry...' })}
          disabled={isSubmitting}
        />
      </div>

      {/* Status Messages */}
      {status.message && (
        <div
          className={`p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting
            ? t('submitting', { defaultValue: 'Sending...' })
            : t('submit', { defaultValue: 'Send Message' })}
        </button>
      </div>

      {/* Alternative Contact */}
      <div className="text-center text-sm text-gray-600">
        <p>
          {t('orEmail', { defaultValue: 'Or email us directly at' })}{' '}
          <a
            href="mailto:contact@khaledaun.com"
            className="text-brand-gold hover:text-brand-gold-dark font-medium"
          >
            contact@khaledaun.com
          </a>
        </p>
      </div>
    </form>
  );
}

