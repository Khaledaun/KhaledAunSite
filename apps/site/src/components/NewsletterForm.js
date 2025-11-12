'use client';

import { useState } from 'react';

/**
 * Newsletter subscription form with honeypot protection
 * Can be embedded inline or in footer
 */
export default function NewsletterForm({ 
  inline = false,
  utmSource = 'website',
  utmMedium = 'newsletter_form',
  utmCampaign = 'general'
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Bot trap

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      console.warn('Bot detected');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: 'website',
          sourceUrl: window.location.href,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Please check your email to confirm your subscription!');
        setEmail('');
        setFirstName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  if (inline) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Subscribe to Newsletter
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get the latest articles and insights delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex="-1"
            autoComplete="off"
          />

          <div>
            <input
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>

          {message && (
            <div className={`text-sm p-3 rounded-md ${
              status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            By subscribing, you agree to receive our newsletter. You can unsubscribe at any time.
          </p>
        </form>
      </div>
    );
  }

  // Footer/compact mode
  return (
    <div className="max-w-md">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Subscribe to Newsletter
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Honeypot field */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex="-1"
          autoComplete="off"
        />

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <div className={`text-xs p-2 rounded-md ${
            status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Unsubscribe anytime. View our{' '}
          <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            privacy policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}

