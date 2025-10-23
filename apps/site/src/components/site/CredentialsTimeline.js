'use client'
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { GraduationCap, Scale, Briefcase, TrendingUp, Gavel } from 'lucide-react';

export default function CredentialsTimeline({ locale }) {
  const t = useTranslations('Credentials');

  const credentials = [
    {
      id: 'llb',
      year: '2011',
      icon: GraduationCap,
      logo: '/images/credentials/hebrew-university.png',
      logoAlt: 'The Hebrew University of Jerusalem',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'bar',
      year: '2014',
      icon: Scale,
      logo: '/images/credentials/israel-bar-association.png',
      logoAlt: 'Israel Bar Association',
      color: 'from-brand-navy to-blue-900',
    },
    {
      id: 'directors',
      year: '2021',
      icon: Briefcase,
      logo: '/images/credentials/hebrew-university.png',
      logoAlt: 'The Hebrew University of Jerusalem - School of Business',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'angel',
      year: '2022',
      icon: TrendingUp,
      logo: '/images/credentials/tel-aviv-university.png',
      logoAlt: 'Tel Aviv University Entrepreneurship Center',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'mediation',
      year: '2023–2024',
      icon: Gavel,
      logo: '/images/credentials/israel-bar-association.png',
      logoAlt: 'Israel Bar Association - National Mediation Institute',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <section id="credentials" className="py-20 bg-brand-sand">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-navy mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-brand-ink/70 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line - Hidden on mobile, visible on md+ */}
            <div 
              className={`hidden md:block absolute ${locale === 'ar' ? 'right-1/2' : 'left-1/2'} top-0 bottom-0 w-0.5 bg-brand-gold/30`}
              style={{ transform: 'translateX(-50%)' }}
            />

            {credentials.map((credential, index) => {
              const Icon = credential.icon;
              const isEven = index % 2 === 0;
              const isRTL = locale === 'ar';
              
              // On RTL, flip the even/odd logic
              const shouldAlignRight = isRTL ? !isEven : isEven;

              return (
                <div key={credential.id} className="relative mb-12 last:mb-0">
                  {/* Mobile Layout - All left aligned */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${credential.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white rounded-lg shadow-lg p-6 border-l-4 border-brand-gold">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-brand-gold">{credential.year}</span>
                          {credential.logo && (
                            <div className="w-16 h-16 relative">
                              <Image
                                src={credential.logo}
                                alt={credential.logoAlt}
                                fill
                                className="object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">
                          {t(`${credential.id}.title`)}
                        </h3>
                        <p className="text-sm font-semibold text-brand-gold mb-3">
                          {t(`${credential.id}.institution`)}
                        </p>
                        <p className="text-brand-ink/80 leading-relaxed">
                          {t(`${credential.id}.description`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Alternating sides */}
                  <div className="hidden md:block">
                    <div className={`flex items-center ${shouldAlignRight ? 'justify-end' : 'justify-start'}`}>
                      {/* Left side content (for left-aligned items) */}
                      {!shouldAlignRight && (
                        <div className="w-5/12 pr-8">
                          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-brand-gold">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-brand-gold">{credential.year}</span>
                              {credential.logo && (
                                <div className="w-20 h-20 relative">
                                  <Image
                                    src={credential.logo}
                                    alt={credential.logoAlt}
                                    fill
                                    className="object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">
                              {t(`${credential.id}.title`)}
                            </h3>
                            <p className="text-sm font-semibold text-brand-gold mb-3">
                              {t(`${credential.id}.institution`)}
                            </p>
                            <p className="text-brand-ink/80 leading-relaxed">
                              {t(`${credential.id}.description`)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Center Icon */}
                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${credential.color} flex items-center justify-center shadow-xl border-4 border-brand-sand`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Right side content (for right-aligned items) */}
                      {shouldAlignRight && (
                        <div className="w-5/12 pl-8">
                          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-brand-gold">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-brand-gold">{credential.year}</span>
                              {credential.logo && (
                                <div className="w-20 h-20 relative">
                                  <Image
                                    src={credential.logo}
                                    alt={credential.logoAlt}
                                    fill
                                    className="object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">
                              {t(`${credential.id}.title`)}
                            </h3>
                            <p className="text-sm font-semibold text-brand-gold mb-3">
                              {t(`${credential.id}.institution`)}
                            </p>
                            <p className="text-brand-ink/80 leading-relaxed">
                              {t(`${credential.id}.description`)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Spacer for the opposite side */}
                      {!shouldAlignRight && <div className="w-5/12" />}
                      {shouldAlignRight && <div className="w-5/12" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

