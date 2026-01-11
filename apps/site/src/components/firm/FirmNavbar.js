'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const FirmNavbar = ({ locale }) => {
  const t = useTranslations('Navigation');
  const tFirm = useTranslations('Firm');
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/practice-areas`, label: t('practiceAreas') },
    { href: `/${locale}/team`, label: t('team') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/community`, label: t('community') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  const localeLinks = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'he', label: 'עברית' },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isSticky
          ? 'bg-white shadow-md py-2'
          : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <div className="relative h-12 w-48">
              {/* NAS Logo - Text version for now */}
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-brand-navy tracking-tight">
                  N
                  <span className="text-brand-gold">A</span>
                  S
                </span>
                <span className="text-sm text-brand-navy ml-1">&amp; Co.</span>
              </div>
              <div className="text-[10px] text-brand-navy tracking-[0.15em] uppercase">
                <span>Nashef</span>
                <span className="text-brand-gold mx-0.5">|</span>
                <span>Aun</span>
                <span className="text-brand-gold mx-0.5">|</span>
                <span>Shaban</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-navy hover:text-brand-gold transition-colors duration-200 text-sm font-medium uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language Switcher & Social */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Social Links */}
            <a
              href="https://www.facebook.com/naslawfirm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-navy hover:text-brand-gold transition-colors"
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
              className="text-brand-navy hover:text-brand-gold transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Language Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-brand-navy hover:text-brand-gold transition-colors text-sm font-medium">
                {locale === 'en' ? 'English' : locale === 'ar' ? 'العربية' : 'עברית'}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {localeLinks.map((lang) => (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}`}
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                      locale === lang.code
                        ? 'text-brand-gold font-medium'
                        : 'text-brand-navy'
                    }`}
                  >
                    {lang.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-brand-navy p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-brand-navy hover:text-brand-gold transition-colors text-sm font-medium uppercase tracking-wide"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                {localeLinks.map((lang) => (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}`}
                    className={`text-sm ${
                      locale === lang.code
                        ? 'text-brand-gold font-medium'
                        : 'text-brand-navy'
                    }`}
                  >
                    {lang.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default FirmNavbar;
