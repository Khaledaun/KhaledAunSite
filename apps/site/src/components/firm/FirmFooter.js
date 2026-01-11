'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FirmFooter = ({ locale }) => {
  const t = useTranslations('Navigation');
  const tPractice = useTranslations('PracticeAreas');

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: `/${locale}/firm`, label: t('about') },
    { href: `/${locale}/firm/practice-areas`, label: t('practiceAreas') },
    { href: `/${locale}/firm/team`, label: t('team') },
    { href: `/${locale}/firm/news`, label: t('news') },
    { href: `/${locale}/firm/contact`, label: t('contact') },
  ];

  const practiceLinks = [
    { href: `/${locale}/firm/practice-areas/commercial-corporate-law`, key: 'commercialCorporate' },
    { href: `/${locale}/firm/practice-areas/startups-hitech-venture-capital`, key: 'startupsVC' },
    { href: `/${locale}/firm/practice-areas/commercial-litigation`, key: 'commercialLitigation' },
    { href: `/${locale}/firm/practice-areas/private-commercial-real-estate`, key: 'realEstate' },
    { href: `/${locale}/firm/practice-areas/construction-zoning-law`, key: 'constructionZoning' },
  ];

  return (
    <footer className="bg-brand-navy text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold tracking-tight">
                  N<span className="text-brand-gold">A</span>S
                </span>
                <span className="text-sm ml-1">&amp; Co.</span>
              </div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">
                Nashef<span className="text-brand-gold mx-0.5">|</span>Aun<span className="text-brand-gold mx-0.5">|</span>Shaban
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {locale === 'he'
                ? 'משרד עורכי דין בוטיק ושותף משפטי לחברות, תאגידים, משקיעים ויזמים.'
                : locale === 'ar'
                ? 'مكتب محاماة بوتيك وشريك قانوني للشركات والمستثمرين ورجال الأعمال.'
                : 'A boutique law firm and legal partner for companies, corporations, investors and entrepreneurs.'}
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/naslawfirm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/nas-law"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-brand-gold">
              {locale === 'he' ? 'קישורים מהירים' : locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-brand-gold">
              {locale === 'he' ? 'תחומי עיסוק' : locale === 'ar' ? 'مجالات الممارسة' : 'Practice Areas'}
            </h4>
            <ul className="space-y-3">
              {practiceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {tPractice(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-brand-gold">
              {locale === 'he' ? 'צור קשר' : locale === 'ar' ? 'اتصل بنا' : 'Contact'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@nas-law.com" className="text-gray-400 hover:text-white transition-colors">
                  info@nas-law.com
                </a>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">
                  {locale === 'he' ? 'ישראל' : locale === 'ar' ? 'إسرائيل' : 'Israel'}
                </span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400">
                  {locale === 'he' ? 'א\'-ה\': 9:00-18:00' : locale === 'ar' ? 'الأحد-الخميس: 9:00-18:00' : 'Sun-Thu: 9:00-18:00'}
                </span>
              </li>
            </ul>

            {/* Languages Badge */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">
                {locale === 'he' ? 'אנחנו מדברים:' : locale === 'ar' ? 'نتحدث:' : 'We speak:'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-white/10 rounded">English</span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded">עברית</span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded">العربية</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>
              © {currentYear} NAS & Co.{' '}
              {locale === 'he' ? 'כל הזכויות שמורות.' : locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href={`/${locale}/firm/privacy`} className="hover:text-white transition-colors">
                {locale === 'he' ? 'מדיניות פרטיות' : locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link href={`/${locale}/firm/terms`} className="hover:text-white transition-colors">
                {locale === 'he' ? 'תנאי שימוש' : locale === 'ar' ? 'شروط الاستخدام' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FirmFooter;
