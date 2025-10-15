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
    { title: t('litigation'), Icon: Icon.Scale },
    { title: t('arbitration'), Icon: Icon.Users },
    { title: t('crossBorder'), Icon: Icon.Globe },
    { title: t('conflictPrevention'), Icon: Icon.Shield },
    { title: t('businessStrategy'), Icon: Icon.Award },
    { title: t('mentorship'), Icon: Icon.BookOpen },
    { title: t('contractLaw'), Icon: Icon.FileText },
    { title: t('compliance'), Icon: Icon.CheckCircle }
  ];

  return (
    <section className="relative md:py-24 py-16" id="about">
      <div className="container">
        <div className="grid lg:grid-cols-12 md:grid-cols-2 grid-cols-1 items-center gap-[30px]">
          <div className="lg:col-span-5 lg:px-8">
            <div className="relative">
              <div className="absolute inset-0 border dark:border-gray-800 rounded-full -mt-[10px] -ms-3 h-[100%] w-[100%] -z-1"></div>
              <Image 
                src="/images/hero/khaled-portrait.jpg" 
                alt="Khaled Aun - Legal Counsel" 
                height={0} 
                width={0} 
                sizes="100vw" 
                style={{height:"auto", width:"100%"}} 
                className="rounded-full shadow-md shadow-gray-200 dark:shadow-gray-800"
              />

              <div className="absolute lg:bottom-20 md:bottom-10 bottom-6 ltr:lg:-right-16 rtl:lg:-left-16 ltr:md:-right-8 rtl:md:-left-8 ltr:right-0 rtl:left-0 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 m-3 w-44 text-center">
                <h6 className="font-semibold">{t('role')}</h6>
                <span className="text-2xl font-medium text-brand-gold mb-0">
                  <CountUp
                    start={0}
                    className="counter-value font-bold"
                    end={15}
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
              <h3 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
                {t('title')}
              </h3>

              <p className="text-slate-400 max-w-xl text-[15px]">
                {t('description')}
              </p>
              <p className="text-slate-400 max-w-xl text-[15px] mt-6">
                {t('experience')}
              </p>
            
              <div className="mt-6">
                <Link 
                  href="#contact" 
                  className="btn bg-brand-gold/10 hover:bg-brand-gold border-brand-gold/10 hover:border-brand-gold text-brand-gold hover:text-white rounded-md me-2 mt-2"
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

        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
          {expertiseData.map((item, index) => {
            const IconComponent = item.Icon;
            return (
              <div 
                className="flex group shadow shadow-gray-200 dark:shadow-gray-800 dark:hover:shadow-gray-700 items-center p-3 rounded-lg bg-white dark:bg-slate-900 transition-all duration-500" 
                key={index}
              >
                <div className="flex items-center justify-center h-[45px] min-w-[45px] -rotate-45 bg-brand-gold/10 group-hover:bg-brand-gold text-brand-gold group-hover:text-white text-center rounded-xl me-5 transition-all duration-500">
                  <div className="rotate-45">
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="mb-0 text-[17px] font-medium">{item.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

