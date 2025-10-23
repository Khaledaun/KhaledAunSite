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
          {/* Social Media Links */}
          <ul className="list-none menu-social mb-0">
            <li className="inline-flex">
              <Link href="https://www.linkedin.com/in/khaledaun" target="_blank" className="ms-1">
                <span className="btn btn-icon btn-sm rounded-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy">
                  <Unicons.UilLinkedin width={16} />
                </span>
              </Link>
              <Link href="mailto:contact@khaledaun.com" className="ms-1">
                <span className="btn btn-icon btn-sm rounded-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy">
                  <Unicons.UilEnvelope width={16} />
                </span>
              </Link>
            </li>
          </ul>

          {/* Language Switcher */}
          <Link 
            href={locale === 'en' ? '/ar' : '/en'} 
            className="ms-2 px-3 py-2 text-sm font-semibold text-dark dark:text-white hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
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
                to="ventures" 
                activeClass="active" 
                spy={true} 
                smooth={true} 
                duration={500} 
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('ventures')}
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

