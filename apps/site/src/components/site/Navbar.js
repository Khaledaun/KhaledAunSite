'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Link as ScrollLink } from 'react-scroll';
import * as Unicons from "@iconscout/react-unicons";
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Navbar({ locale }) {
  const t = useTranslations('Navigation');
  const [stickyNavbar, setStickyNavbar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", windowScroll);
      return () => window.removeEventListener("scroll", windowScroll);
    }
  }, []);

  useEffect(() => {
    // Fetch logo from API
    fetch('/api/site-logo')
      .then(res => res.json())
      .then(data => {
        if (data.logo) {
          setLogo(data.logo);
        }
      })
      .catch(err => console.error('Failed to fetch logo:', err));
  }, []);

  function windowScroll() {
    setStickyNavbar(document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`${stickyNavbar ? "is-sticky" : ""} navbar`} id="navbar" style={{ padding: '0.5cm 0' }}>
      <div className="container flex flex-wrap items-center justify-between" style={{ padding: '0 0.5cm' }}>
        <Link href={`/${locale}`} className="navbar-brand md:me-8 flex items-center">
          {logo ? (
            <Image 
              src={logo.url} 
              alt={logo.alt || 'Khaled Aun'} 
              width={logo.width || 200} 
              height={logo.height || 60}
              className="h-auto"
              style={{ maxHeight: '60px', width: 'auto' }}
            />
          ) : (
            <span className="text-4xl font-bold text-brand-gold">
              {locale === 'ar' ? 'خالد عون' : 'Khaled Aun'}
            </span>
          )}
        </Link>

        <div className="nav-icons flex items-center lg_992:order-2 ms-auto md:ms-8">
          {/* LaWra Login Button */}
          <Link
            href={process.env.NEXT_PUBLIC_LAWRA_URL || "http://localhost:3002/login"}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>{locale === 'ar' ? 'לורה' : 'LaWra'}</span>
          </Link>

          {/* Social Media Links */}
          <ul className="list-none menu-social mb-0 flex items-center ms-3">
            <li className="inline-flex">
              <Link href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/khaledaun"} target="_blank" className="ms-1">
                <span className="w-10 h-10 rounded-full bg-brand-gold hover:bg-brand-gold/90 flex items-center justify-center transition-all duration-200 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </span>
              </Link>
              <Link href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/in/khaledaun"} target="_blank" className="ms-1">
                <span className="w-10 h-10 rounded-full bg-brand-gold hover:bg-brand-gold/90 flex items-center justify-center transition-all duration-200 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </span>
              </Link>
            </li>
          </ul>

          {/* Language Switcher */}
          <Link
            href={locale === 'en' ? '/ar' : '/en'}
            className={`ms-2 px-3 py-2 text-sm font-semibold text-dark dark:text-white hover:text-brand-gold dark:hover:text-brand-gold transition-colors ${locale === 'en' ? 'font-cairo' : ''}`}
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMenu}
            type="button" 
            className="collapse-btn inline-flex items-center ms-2 text-dark dark:text-white lg_992:hidden" 
            aria-label="Navigation Menu"
          >
            <i className="mdi mdi-menu text-[24px]"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className={`navigation lg_992:order-1 lg_992:flex ${isMenuOpen ? '' : 'hidden'} ms-auto`} id="menu-collapse">
          <ul className="navbar-nav" id="navbar-navlist">
            <li className="nav-item">
              <ScrollLink 
                to="home" 
                activeClass="active" 
                spy={true} 
                smooth={true} 
                duration={500} 
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink 
                to="about" 
                activeClass="active" 
                spy={true} 
                smooth={true} 
                duration={500} 
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink 
                to="services" 
                activeClass="active" 
                spy={true} 
                smooth={true} 
                duration={500} 
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('services')}
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink
                to="process"
                activeClass="active"
                spy={true}
                smooth={true}
                duration={500}
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('process')}
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink
                to="experience"
                activeClass="active"
                spy={true}
                smooth={true}
                duration={500}
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('experience')}
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink
                to="contact"
                activeClass="active"
                spy={true}
                smooth={true}
                duration={500}
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact')}
              </ScrollLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

