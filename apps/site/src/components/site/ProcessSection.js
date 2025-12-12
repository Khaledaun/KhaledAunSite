'use client'
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import * as Icon from 'react-feather';

export default function ProcessSection() {
  const t = useTranslations('Process');

  const processSteps = [
    {
      number: "01",
      title: t('step1Title'),
      desc: t('step1Desc'),
      Icon: Icon.Search
    },
    {
      number: "02",
      title: t('step2Title'),
      desc: t('step2Desc'),
      Icon: Icon.Map
    },
    {
      number: "03",
      title: t('step3Title'),
      desc: t('step3Desc'),
      Icon: Icon.MessageCircle
    },
    {
      number: "04",
      title: t('step4Title'),
      desc: t('step4Desc'),
      Icon: Icon.CheckCircle
    }
  ];

  return (
    <section className="relative md:py-24 py-16 bg-white dark:bg-slate-900" id="process">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h2 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h2>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
          {processSteps.map((step, index) => {
            const IconComponent = step.Icon;
            return (
              <div
                className="relative group"
                key={index}
              >
                {/* Connector line (not on last item) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-brand-gold/20"></div>
                )}

                <div className="text-center">
                  {/* Step number */}
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-gold/20 transition-colors duration-300">
                      <IconComponent className="h-7 w-7 text-brand-gold" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-brand-gold text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold mb-3 text-slate-800 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-[15px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="#contact"
            className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold hover:border-brand-gold/90 text-white rounded-md"
          >
            Start a Conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
