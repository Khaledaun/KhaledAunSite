'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function HeroDennis({ locale }) {
  const t = useTranslations('Hero');
  const [titles, setTitles] = useState(
    locale === 'ar' 
      ? ['خبير التقاضي', 1000, 'مستشار حل ومنع النزاعات', 1000, 'محكم معتمد (CiArb)', 1000, 'مستشار قانوني عبر الحدود', 1000]
      : ['Litigation Expert', 1000, 'Conflict Resolution and Prevention Advisor', 1000, 'Certified Arbitrator (CiArb)', 1000, 'Cross Border Legal Counsel', 1000]
  );
  const [heroMedia, setHeroMedia] = useState(null);

  useEffect(() => {
    // Fetch hero titles
    fetch('/api/hero-titles')
      .then(res => res.json())
      .then(data => {
        if (data.titles && data.titles.length > 0) {
          const sequence = data.titles.flatMap(title => [
            locale === 'ar' ? title.titleAr : title.titleEn,
            1000
          ]);
          setTitles(sequence);
        }
      })
      .catch(err => console.error('Error fetching hero titles:', err));

    // Fetch hero media
    fetch('/api/hero-media')
      .then(res => res.json())
      .then(data => {
        if (data.media) {
          setHeroMedia(data.media);
        }
      })
      .catch(err => console.error('Error fetching hero media:', err));
  }, [locale]);

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    return match ? match[1] : null;
  };

  const renderHeroMedia = () => {
    if (!heroMedia || heroMedia.type === 'IMAGE' || !heroMedia.videoUrl) {
      // Default to image
      return (
        <Image 
          height={600} 
          width={600} 
          src={heroMedia?.imageUrl || "/images/hero/khaled-portrait.jpg"}
          alt="Khaled Aun"
          className="rounded-lg shadow-lg"
          priority
        />
      );
    }

    // Render video
    if (heroMedia.type === 'VIDEO') {
      if (heroMedia.videoType === 'youtube') {
        const videoId = extractYouTubeId(heroMedia.videoUrl);
        if (videoId) {
          return (
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}${heroMedia.autoplay ? '?autoplay=1&mute=1&loop=1&playlist=' + videoId : ''}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          );
        }
      }

      if (heroMedia.videoType === 'vimeo') {
        const videoId = extractVimeoId(heroMedia.videoUrl);
        if (videoId) {
          return (
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}${heroMedia.autoplay ? '?autoplay=1&muted=1&loop=1&background=1' : ''}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          );
        }
      }

      if (heroMedia.videoType === 'selfhosted' && heroMedia.videoUrl) {
        return (
          <video
            src={heroMedia.videoUrl}
            autoPlay={heroMedia.autoplay}
            muted={heroMedia.autoplay}
            loop={heroMedia.autoplay}
            controls={!heroMedia.autoplay}
            className="w-full rounded-lg shadow-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      }
    }

    // Fallback to default image
    return (
      <Image 
        height={600} 
        width={600} 
        src="/images/hero/khaled-portrait.jpg"
        alt="Khaled Aun"
        className="rounded-lg shadow-lg"
        priority
      />
    );
  };

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
              {renderHeroMedia()}

              <div className="absolute lg:bottom-20 md:bottom-10 bottom-2 ltr:md:-left-5 ltr:left-2 rtl:md:-right-5 rtl:right-2 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 m-3 w-44 text-center">
                <span className="text-3xl font-medium mb-0">
                  <CountUp
                    start={0}
                    className="counter-value"
                    end={12}
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

