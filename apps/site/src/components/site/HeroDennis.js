'use client'
import React from "react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function HeroDennis({ locale }) {
  const t = useTranslations('Hero');

  const titles = locale === 'ar' 
    ? ['خالد عون', 1000, 'مستشار قانوني', 1000, 'خبير استراتيجية أعمال', 1000, 'مؤسس شركات', 1000]
    : ['Khaled Aun', 1000, 'Legal Counsel', 1000, 'Business Strategist', 1000, 'Entrepreneur', 1000];

  return (
    <>
      <section className="relative pt-28 pb-16 personal-wrapper overflow-hidden bg-brand-gold/5" id="home">
        <div className="absolute inset-0" id="overlay"></div>
        <div className="container">
          <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-[30px]">
            <div>
              <h4 className="font-bold lg:text-[40px] text-3xl lg:leading-normal leading-normal mb-4">
                {t('greeting')}<br />
                <TypeAnimation
                  sequence={titles}
                  wrapper="span"
                  speed={50}
                  className="typewrite text-brand-gold"
                  repeat={Infinity}
                />
              </h4>
              <p className="text-slate-400 max-w-xl">
                {t('description')}
              </p>

              <div className="mt-6">
                <Link href="#contact" className="btn btn-primary">
                  {t('hireCTA')}
                </Link>
                <Link href="/Khaled_Aun_CV.pdf" className="btn btn-secondary ms-2" target="_blank">
                  {t('downloadCV')}
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image 
                height={600} 
                width={600} 
                src="/images/hero/khaled-portrait.jpg" 
                alt="Khaled Aun"
                className="rounded-lg shadow-lg"
                priority
              />

              <div className="absolute lg:bottom-20 md:bottom-10 bottom-2 ltr:md:-left-5 ltr:left-2 rtl:md:-right-5 rtl:right-2 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 m-3 w-44 text-center">
                <span className="text-3xl font-medium mb-0">
                  <CountUp
                    start={0}
                    className="counter-value"
                    end={15}
                    duration={2.75}
                  />+
                </span>
                <h6 className="text-sm text-slate-400 mt-1">
                  {t('yearsExperience')}
                </h6>
              </div>

              <div className="absolute lg:top-80 md:top-56 top-48 ltr:md:-right-0 ltr:right-2 rtl:md:-left-0 rtl:left-2 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 m-3 w-44 text-center">
                <h6 className="font-semibold">{t('role')}</h6>
                <h6 className="text-sm text-slate-400 mt-1">{t('specialization')}</h6>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="relative">
        <div className="absolute block w-full h-auto bottom-[25px] z-1 left-0">
          <Link href="#about">
            <i className="mdi mdi-arrow-down absolute top-0 left-0 right-0 text-center inline-flex items-center justify-center rounded-full bg-white dark:bg-slate-900 h-12 w-12 mx-auto shadow-md dark:shadow-gray-800"></i>
          </Link>
        </div>
      </div>
    </>
  );
}

