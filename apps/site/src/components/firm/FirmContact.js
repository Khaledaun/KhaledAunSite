'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const FirmContact = ({ locale }) => {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practiceArea: '',
    message: '',
    language: locale,
  });
  const [status, setStatus] = useState('idle');

  const practiceAreaOptions = [
    { value: '', label: { en: 'Select Practice Area', ar: 'اختر مجال الممارسة', he: 'בחר תחום עיסוק' } },
    { value: 'commercial-corporate', label: { en: 'Commercial & Corporate Law', ar: 'القانون التجاري والشركات', he: 'משפט מסחרי ותאגידי' } },
    { value: 'startups-vc', label: { en: 'Startups & Venture Capital', ar: 'الشركات الناشئة ورأس المال المخاطر', he: 'סטארטאפים והון סיכון' } },
    { value: 'tax', label: { en: 'Tax Law', ar: 'قانون الضرائب', he: 'דיני מיסים' } },
    { value: 'construction', label: { en: 'Construction & Zoning', ar: 'البناء والتنظيم', he: 'בנייה ותכנון' } },
    { value: 'employment', label: { en: 'Employment & Labor', ar: 'قانون العمل', he: 'דיני עבודה' } },
    { value: 'real-estate', label: { en: 'Real Estate', ar: 'العقارات', he: 'נדל"ן' } },
    { value: 'litigation', label: { en: 'Commercial Litigation', ar: 'التقاضي التجاري', he: 'ליטיגציה מסחרית' } },
    { value: 'other', label: { en: 'Other', ar: 'أخرى', he: 'אחר' } },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interest: 'GENERAL',
          source: 'FIRM_WEBSITE',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          practiceArea: '',
          message: '',
          language: locale,
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="py-20 bg-brand-navy" id="contact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="text-white">
            <div className="w-16 h-1 bg-brand-gold mb-4"></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {locale === 'he' ? 'צור קשר' :
               locale === 'ar' ? 'اتصل بنا' :
               'Contact Us'}
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              {locale === 'he' ? 'נשמח לשמוע ממך. צור קשר עם משרדנו לקבלת ייעוץ משפטי.' :
               locale === 'ar' ? 'يسعدنا أن نسمع منك. اتصل بمكتبنا للحصول على استشارة قانونية.' :
               'We\'d love to hear from you. Contact our office for legal consultation.'}
            </p>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-gold mb-1">
                    {locale === 'he' ? 'כתובת' : locale === 'ar' ? 'العنوان' : 'Address'}
                  </h4>
                  <p className="text-gray-300">
                    {locale === 'he' ? 'ישראל' : locale === 'ar' ? 'إسرائيل' : 'Israel'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-gold mb-1">
                    {locale === 'he' ? 'אימייל' : locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </h4>
                  <a href="mailto:info@nas-law.com" className="text-gray-300 hover:text-white transition-colors">
                    info@nas-law.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-gold mb-1">
                    {locale === 'he' ? 'שעות פעילות' : locale === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  </h4>
                  <p className="text-gray-300">
                    {locale === 'he' ? 'ראשון - חמישי: 9:00 - 18:00' :
                     locale === 'ar' ? 'الأحد - الخميس: 9:00 - 18:00' :
                     'Sunday - Thursday: 9:00 AM - 6:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <h4 className="font-semibold text-brand-gold mb-3">
                {locale === 'he' ? 'שפות' : locale === 'ar' ? 'اللغات' : 'Languages'}
              </h4>
              <div className="flex space-x-4">
                <span className="px-3 py-1 bg-brand-gold/20 rounded text-sm">English</span>
                <span className="px-3 py-1 bg-brand-gold/20 rounded text-sm">עברית</span>
                <span className="px-3 py-1 bg-brand-gold/20 rounded text-sm">العربية</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-xl">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  {locale === 'he' ? 'תודה!' : locale === 'ar' ? 'شكرا!' : 'Thank You!'}
                </h3>
                <p className="text-gray-600">{t('successMessage')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'he' ? 'טלפון' : locale === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'he' ? 'תחום עיסוק' : locale === 'ar' ? 'مجال الممارسة' : 'Practice Area'}
                    </label>
                    <select
                      value={formData.practiceArea}
                      onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                    >
                      {practiceAreaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label[locale] || option.label.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('message')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                    placeholder={t('messagePlaceholder')}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full px-8 py-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-brand-gold/90 transition-all duration-200 disabled:opacity-50"
                >
                  {status === 'submitting' ? t('submitting') : t('submit')}
                </button>

                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center">{t('errorMessage')}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirmContact;
