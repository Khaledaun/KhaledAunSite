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
      title: t('disputeStrategy'),
      desc: t('disputeStrategyDesc'),
      features: [t('disputeStrategyFeature1'), t('disputeStrategyFeature2'), t('disputeStrategyFeature3')],
      Icon: Icon.Target
    },
    {
      title: t('governance'),
      desc: t('governanceDesc'),
      features: [t('governanceFeature1'), t('governanceFeature2'), t('governanceFeature3')],
      Icon: Icon.Shield
    },
    {
      title: t('crossBorder'),
      desc: t('crossBorderDesc'),
      features: [t('crossBorderFeature1'), t('crossBorderFeature2'), t('crossBorderFeature3')],
      Icon: Icon.Globe
    },
    {
      title: t('advisory'),
      desc: t('advisoryDesc'),
      features: [t('advisoryFeature1'), t('advisoryFeature2'), t('advisoryFeature3')],
      Icon: Icon.Users
    }
  ];

  return (
    <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="services">
      <div className="container">
        <div className="grid grid-cols-1 pb-8 text-center">
          <h2 className="mb-6 md:text-2xl text-xl md:leading-normal leading-normal font-semibold">
            {t('title')}
          </h2>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
          {servicesData.map((item, index) => {
            const IconComponent = item.Icon;
            return (
              <div
                className="px-6 py-8 shadow shadow-gray-200 hover:shadow-md dark:shadow-gray-800 dark:hover:shadow-gray-700 transition duration-500 rounded-2xl bg-white dark:bg-slate-900"
                key={index}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-7 w-7 stroke-1 text-brand-gold" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold mb-2 text-slate-800 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-4">
                      {item.desc}
                    </p>

                    {/* Feature bullets */}
                    <ul className="space-y-2 mb-5">
                      {item.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Icon.Check className="w-4 h-4 text-brand-gold flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Micro-CTA */}
                    <Link
                      href="#contact"
                      className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-gold/80 font-medium text-sm transition duration-300"
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
