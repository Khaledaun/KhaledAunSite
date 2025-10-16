'use client'
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import * as Unicons from "@iconscout/react-unicons";

export default function FooterDennis({ locale }) {
  const t = useTranslations('Footer');
  
  return (
    <footer className="footer bg-dark-footer relative text-gray-200 dark:text-gray-200">
      <div className="py-[30px] px-0 border-t border-slate-800">
        <div className="container text-center">
          <div className="grid lg:grid-cols-12 md:grid-cols-3 grid-cols-1 items-center">
            <div className="lg:col-span-3 md:text-start text-center">
              <Link href={`/${locale}`} className="text-[22px] focus:outline-none">
                <span className="text-2xl font-bold text-brand-gold">
                  {locale === 'ar' ? 'خالد عون' : 'Khaled Aun'}
                </span>
              </Link>
            </div>

            <div className="lg:col-span-5 text-center mt-6 md:mt-0">
              <p className="mb-0">
                © {new Date().getFullYear()} Khaled Aun. {t('allRightsReserved')}
              </p>
            </div>

            <ul className="lg:col-span-4 list-none md:text-end text-center mt-6 md:mt-0 space-x-1">
              <li className="inline">
                <Link 
                  href="https://www.linkedin.com/in/khaledaun" 
                  target="_blank" 
                  className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                  aria-label="LinkedIn"
                >
                  <Unicons.UilLinkedin width={16} />
                </Link>
              </li>
              <li className="inline">
                <Link 
                  href="https://twitter.com/khaledaun" 
                  target="_blank" 
                  className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                  aria-label="Twitter"
                >
                  <Unicons.UilTwitter width={16} />
                </Link>
              </li>
              <li className="inline">
                <Link 
                  href="https://www.instagram.com/khaledaun" 
                  target="_blank" 
                  className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                  aria-label="Instagram"
                >
                  <Unicons.UilInstagram width={16} />
                </Link>
              </li>
              <li className="inline">
                <Link 
                  href="mailto:contact@khaledaun.com" 
                  className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                  aria-label="Email"
                >
                  <Unicons.UilEnvelope width={16} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

