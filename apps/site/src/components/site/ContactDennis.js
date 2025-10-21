'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import * as Unicons from '@iconscout/react-unicons'

export default function ContactDennis() {
  const t = useTranslations('Consultation');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="contact">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h3 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('calendlyDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 md:grid-cols-2 mt-8 items-center gap-[30px]">
          <div className="lg:col-span-8">
            <div className="p-6 rounded-md shadow bg-white dark:bg-slate-900">
              <form onSubmit={handleSubmit}>
                {status.message && (
                  <div className={`mb-5 p-4 rounded ${
                    status.type === 'success' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {status.message}
                  </div>
                )}
                
                <div className="grid lg:grid-cols-12 lg:gap-5">
                  <div className="lg:col-span-6 mb-5">
                    <input 
                      name="name" 
                      id="name" 
                      type="text" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input w-full py-2 px-3 border border-inherit dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 rounded h-10 outline-none bg-transparent focus:border-brand-gold/50 dark:focus:border-brand-gold/50 focus:shadow-none focus:ring-0 text-[15px]" 
                      placeholder={t('namePlaceholder')}
                    />
                  </div>

                  <div className="lg:col-span-6 mb-5">
                    <input 
                      name="email" 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input w-full py-2 px-3 border border-inherit dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 rounded h-10 outline-none bg-transparent focus:border-brand-gold/50 dark:focus:border-brand-gold/50 focus:shadow-none focus:ring-0 text-[15px]" 
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1">
                  <div className="mb-5">
                    <input 
                      name="phone" 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input w-full py-2 px-3 border border-inherit dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 rounded h-10 outline-none bg-transparent focus:border-brand-gold/50 dark:focus:border-brand-gold/50 focus:shadow-none focus:ring-0 text-[15px]" 
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>

                  <div className="mb-5">
                    <textarea 
                      name="message" 
                      id="message" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-input w-full py-2 px-3 border border-inherit dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 rounded h-28 outline-none bg-transparent focus:border-brand-gold/50 dark:focus:border-brand-gold/50 focus:shadow-none focus:ring-0 text-[15px]" 
                      placeholder={t('messagePlaceholder')}
                    ></textarea>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold hover:border-brand-gold/90 text-white rounded-md h-11 justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : t('sendMessage')}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:ms-8">
              <div className="flex">
                <div className="icons text-center mx-auto">
                  <Unicons.UilPhone className="block rounded text-2xl dark:text-white mb-0 text-brand-gold" />
                </div>

                <div className="flex-1 ms-6">
                  <h5 className="text-[17px] dark:text-white mb-2 font-medium">Phone</h5>
                  <Link href="tel:+1-555-123-4567" className="text-slate-400 text-[15px] hover:text-brand-gold transition-colors">
                    +1-555-123-4567
                  </Link>
                </div>
              </div>

              <div className="flex mt-4">
                <div className="icons text-center mx-auto">
                  <Unicons.UilEnvelope className="block rounded text-2xl dark:text-white mb-0 text-brand-gold" />
                </div>

                <div className="flex-1 ms-6">
                  <h5 className="text-[17px] dark:text-white mb-2 font-medium">Email</h5>
                  <Link href="mailto:contact@khaledaun.com" className="text-slate-400 text-[15px] hover:text-brand-gold transition-colors">
                    contact@khaledaun.com
                  </Link>
                </div>
              </div>

              <div className="flex mt-4">
                <div className="icons text-center mx-auto">
                  <Unicons.UilMapMarker className="block rounded text-2xl dark:text-white mb-0 text-brand-gold" />
                </div>

                <div className="flex-1 ms-6">
                  <h5 className="text-[17px] dark:text-white mb-2 font-medium">Location</h5>
                  <p className="text-slate-400 text-[15px] mb-2">New York, NY, USA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

