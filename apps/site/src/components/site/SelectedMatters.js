'use client'
import React from "react";
import { useTranslations } from 'next-intl';
import * as Icon from 'react-feather';

export default function SelectedMatters() {
  const t = useTranslations('SelectedMatters');

  const matters = [
    t('matter1'),
    t('matter2'),
    t('matter3'),
    t('matter4'),
    t('matter5'),
    t('matter6')
  ];

  return (
    <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="experience">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h2 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h2>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-8">
          <div className="grid grid-cols-1 gap-4">
            {matters.map((matter, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl shadow shadow-gray-200 dark:shadow-gray-800"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                    <Icon.FileText className="h-5 w-5 text-brand-gold" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
                  {matter}
                </p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-center text-slate-400 text-sm mt-8 italic">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
