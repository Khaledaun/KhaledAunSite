'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import CountUp from 'react-countup';
import * as Icon from 'react-feather';

export default function AboutDennis() {
  const t = useTranslations('About');

  const expertiseData = [
    { title: t('disputeStrategy'), Icon: Icon.Target },
    { title: t('arbitration'), Icon: Icon.Users },
    { title: t('crossBorder'), Icon: Icon.Globe },
    { title: t('governance'), Icon: Icon.Shield },
    { title: t('conflictPrevention'), Icon: Icon.AlertCircle },
    { title: t('advisoryMentorship'), Icon: Icon.Compass }
  ];

  return (
    <section className="relative md:py-24 py-16" id="about">
      <div className="container">
        <div className="grid lg:grid-cols-12 md:grid-cols-2 grid-cols-1 items-center gap-[30px]">
          <div className="lg:col-span-5 lg:px-8">
            <div className="relative">
              <div className="absolute inset-0 border dark:border-gray-800 rounded-full -mt-[10px] -ms-3 h-[100%] w-[100%] -z-1"></div>
              <Image
                src="/images/hero/khaled-about.jpg"
                alt="Khaled Aun - Dispute Resolution & Governance Counsel"
                height={0}
                width={0}
                sizes="100vw"
                style={{height:"auto", width:"100%"}}
                className="rounded-full shadow-md shadow-gray-200 dark:shadow-gray-800"
              />

              <div className="absolute lg:bottom-20 md:bottom-10 bottom-6 ltr:lg:-right-16 rtl:lg:-left-16 ltr:md:-right-8 rtl:md:-left-8 ltr:right-0 rtl:left-0 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 m-3 w-48 text-center">
                <h6 className="font-semibold text-sm">{t('role')}</h6>
                <span className="text-2xl font-medium text-brand-gold mb-0">
                  <CountUp
                    start={0}
                    className="counter-value font-bold"
                    end={12}
                    duration={2.75}
                  />+
                </span>
                <span className="text-sm text-slate-400">
                  {t('yearsExperience')}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="lg:ms-5">
              <h2 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
                {t('title')}
              </h2>

              {/* Philosophy narrative */}
              <p className="text-slate-600 dark:text-slate-300 max-w-xl text-[16px] font-medium mb-4">
                {t('description')}
              </p>

              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-[15px] mb-4">
                {t('experience')}
              </p>

              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-[15px] mb-6">
                {t('philosophy')}
              </p>

              {/* What I'm Not - signal focus */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-brand-gold p-4 rounded-r-lg mb-6">
                <p className="text-slate-600 dark:text-slate-300 text-[15px] italic">
                  {t('whatImNot')}
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="#contact"
                  className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold hover:border-brand-gold/90 text-white rounded-md me-2 mt-2"
                >
                  {t('contactCTA')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container md:mt-24 mt-16">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h3 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('expertiseTitle')}
          </h3>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('expertiseSubtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
          {expertiseData.map((item, index) => {
            const IconComponent = item.Icon;
            return (
              <div
                className="flex group shadow shadow-gray-200 dark:shadow-gray-800 dark:hover:shadow-gray-700 items-center p-4 rounded-lg bg-white dark:bg-slate-900 transition-all duration-500"
                key={index}
              >
                <div className="flex items-center justify-center h-[45px] min-w-[45px] -rotate-45 bg-brand-gold/10 group-hover:bg-brand-gold text-brand-gold group-hover:text-white text-center rounded-xl me-5 transition-all duration-500">
                  <div className="rotate-45">
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="mb-0 text-[16px] font-medium">{item.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
