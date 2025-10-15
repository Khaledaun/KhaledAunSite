'use client'
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { experienceData } from '../../data/experience';

export default function ExperienceTimelineDennis() {
  const t = useTranslations('Experience');

  return (
    <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="experience">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h3 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 mt-8">
          <div className="relative after:content-[''] after:absolute after:top-0 ltr:md:after:right-0 ltr:md:after:left-0 rtl:md:after:left-0 rtl:md:after:right-0 after:w-px after:h-full md:after:m-auto after:border-s-2 after:border-dashed after:border-gray-200 dark:after:border-gray-700 ms-3 md:ms-0">
            
            {experienceData.map((item, index) => (
              <div 
                key={item.id}
                className={`${index > 0 ? 'mt-12' : ''} ms-8 md:ms-0 relative after:content-[''] after:absolute after:top-[9px] after:rounded-full after:z-10 after:w-2.5 after:h-2.5 after:bg-brand-gold md:after:mx-auto ltr:md:after:right-0 ltr:md:after:left-0 ${index % 2 === 0 ? 'ltr:after:-left-9 rtl:after:-right-9' : 'ltr:after:-left-9 rtl:after:-right-9'} before:content-[''] before:absolute md:before:mx-auto ltr:md:before:right-0 ltr:md:before:left-0 ${index % 2 === 0 ? 'ltr:before:-left-11 rtl:before:-right-11' : 'ltr:before:-left-11 rtl:before:-right-11'} before:rounded-full before:z-10 before:border-2 before:border-dashed before:border-gray-200 dark:before:border-gray-700 before:top-0 before:w-7 before:h-7 before:bg-white dark:before:bg-slate-900`}
              >
                <div className="grid md:grid-cols-2">
                  <div className={`${index % 2 === 0 ? 'md:text-end md:me-8' : 'text-start md:ms-8 md:order-2'} relative`}>
                    <Image 
                      src={item.logo} 
                      className="rounded-full h-9 w-9 md:ms-auto" 
                      alt={`${item.company} logo`}
                      height={36} 
                      width={36}
                    />
                    <h5 className="my-2 font-semibold text-lg">{item.company}</h5>
                    <h6 className="text-sm mb-0 text-slate-400">{item.period}</h6>
                  </div>

                  <div className={`ltr:float-left rtl:float-right ${index % 2 === 0 ? 'text-start md:ms-8' : 'md:text-end md:me-8 md:order-1'} mt-6 md:mt-0`}>
                    <h5 className="title mb-1 font-semibold">{item.role}</h5>
                    <p className="mt-3 mb-0 text-slate-400 text-[15px]">{item.summary}</p>
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* CTA Section */}
        <div className="container md:mt-24 mt-16">
          <div className="grid grid-cols-1 text-center">
            <h3 className="mb-4 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
              {t('ctaTitle')}
            </h3>
            <p className="text-slate-400 max-w-xl mx-auto">
              {t('ctaDescription')}
            </p>

            <div className="mt-6">
              <button
                onClick={() => {
                  const event = new CustomEvent('openConsultationModal');
                  window.dispatchEvent(event);
                }}
                className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold hover:border-brand-gold/90 text-white rounded-md"
              >
                {t('bookConsultation')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

