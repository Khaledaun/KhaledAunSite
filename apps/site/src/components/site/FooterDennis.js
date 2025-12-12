'use client'
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import * as Unicons from "@iconscout/react-unicons";

export default function FooterDennis({ locale }) {
  const t = useTranslations('Footer');

  return (
    <footer className="footer bg-dark-footer relative text-gray-200 dark:text-gray-200">
      <div className="container py-12">
        <div className="grid lg:grid-cols-12 md:grid-cols-2 grid-cols-1 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-4">
            <Link href={`/${locale}`} className="text-[22px] focus:outline-none">
              <span className="text-2xl font-bold text-brand-gold">
                {locale === 'ar' ? 'خالد عون' : 'Khaled Aun'}
              </span>
            </Link>
            <p className="text-slate-400 text-sm mt-4 max-w-xs">
              {t('description')}
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h5 className="font-semibold text-white mb-4">{t('navigation')}</h5>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/#about`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#process`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('process')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#contact`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h5 className="font-semibold text-white mb-4">{t('services')}</h5>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/#services`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('disputeStrategy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#services`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('governance')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#services`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('crossBorder')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/#services`} className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  {t('advisory')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h5 className="font-semibold text-white mb-4">{t('contact')}</h5>
            <ul className="space-y-2">
              <li>
                <Link href="mailto:contact@khaledaun.com" className="text-slate-400 hover:text-brand-gold transition-colors text-sm">
                  contact@khaledaun.com
                </Link>
              </li>
              <li className="text-slate-400 text-sm">
                {t('location')}
              </li>
            </ul>
            <div className="flex gap-2 mt-4">
              <Link
                href="https://www.linkedin.com/in/khaledaun"
                target="_blank"
                className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                aria-label="LinkedIn"
              >
                <Unicons.UilLinkedin width={16} />
              </Link>
              <Link
                href="mailto:contact@khaledaun.com"
                className="btn btn-icon btn-sm border border-gray-800 rounded-md hover:border-brand-gold dark:hover:border-brand-gold hover:bg-brand-gold dark:hover:bg-brand-gold"
                aria-label="Email"
              >
                <Unicons.UilEnvelope width={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-[20px] px-0 border-t border-slate-800">
        <div className="container text-center">
          <p className="mb-0 text-slate-400 text-sm">
            © {new Date().getFullYear()} Khaled Aun. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
