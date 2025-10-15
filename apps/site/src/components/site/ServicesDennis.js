'use client'
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import * as Icon from 'react-feather';
import * as Unicons from "@iconscout/react-unicons";

export default function ServicesDennis() {
  const t = useTranslations('Services');
  
  const servicesData = [
    {
      title: t('litigation'),
      desc: t('litigationDesc'),
      Icon: Icon.Scale
    },
    {
      title: t('arbitration'),
      desc: t('arbitrationDesc'),
      Icon: Icon.Users
    },
    {
      title: t('crossBorder'),
      desc: t('crossBorderDesc'),
      Icon: Icon.Globe
    },
    {
      title: t('conflictPrevention'),
      desc: t('conflictPreventionDesc'),
      Icon: Icon.Shield
    },
    {
      title: t('businessAdvisory'),
      desc: t('businessAdvisoryDesc'),
      Icon: Icon.Award
    },
    {
      title: t('mentorship'),
      desc: t('mentorshipDesc'),
      Icon: Icon.BookOpen
    }
  ];

  return (
    <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="services">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h3 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h3>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
          {servicesData.map((item, index) => {
            const IconComponent = item.Icon;
            return (
              <div 
                className="px-6 py-10 shadow shadow-gray-200 hover:shadow-md dark:shadow-gray-800 dark:hover:shadow-gray-700 transition duration-500 rounded-2xl bg-white dark:bg-slate-900" 
                key={index}
              >
                <IconComponent className="h-10 w-10 stroke-1 text-brand-gold" />

                <div className="content mt-7">
                  <Link href="#contact" className="title h5 text-[17px] font-medium hover:text-brand-gold">
                    {item.title}
                  </Link>
                  <p className="text-slate-400 mt-3 text-[15px]">{item.desc}</p>
                  
                  <div className="mt-5">
                    <Link 
                      href="#contact" 
                      className="hover:text-brand-gold dark:hover:text-brand-gold after:bg-brand-gold dark:text-white transition duration-500 inline-flex items-center gap-1"
                    >
                      {t('learnMore')} <Unicons.UilArrowRight width={16} />
                    </Link>
                  </div>
                </div>
              </div> 
            );
          })}
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
              <Link 
                href="#contact" 
                className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold hover:border-brand-gold/90 text-white rounded-md"
              >
                {t('bookConsultation')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

