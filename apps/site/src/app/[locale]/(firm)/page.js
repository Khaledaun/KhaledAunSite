import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmHero from '@/components/firm/FirmHero';
import FirmAbout from '@/components/firm/FirmAbout';
import FirmPracticeAreas from '@/components/firm/FirmPracticeAreas';
import FirmTeamPreview from '@/components/firm/FirmTeamPreview';
import FirmContact from '@/components/firm/FirmContact';
import FirmFooter from '@/components/firm/FirmFooter';
import Script from 'next/script';

// Force dynamic rendering to ensure correct locale is used
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    en: 'NAS & Co. | Nashef, Aun, Shaban & Co. Law Firm',
    ar: 'ناشف، عون، شعبان وشركاه | مكتب محاماة',
    he: 'נאשף, עון, שאבאן ושות\' | משרד עורכי דין',
  };

  const descriptions = {
    en: 'NAS & Co. is a boutique law firm and a legal partner for companies, corporations, investors and entrepreneurs, offering highly specialized counseling.',
    ar: 'ناشف، عون، شعبان وشركاه هو مكتب محاماة بوتيك وشريك قانوني للشركات والمستثمرين ورجال الأعمال.',
    he: 'נאשף, עון, שאבאן ושות\' הוא משרד עורכי דין בוטיק ושותף משפטי לחברות, תאגידים, משקיעים ויזמים.',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: [
      'law firm',
      'legal services',
      'corporate law',
      'venture capital',
      'commercial litigation',
      'real estate law',
      'Israel',
      'NAS',
      'Nashef Aun Shaban',
    ],
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : locale === 'he' ? 'he_IL' : 'en_US',
      siteName: 'NAS & Co.',
    },
  };
}

export default function FirmHomePage({ params: { locale } }) {
  unstable_setRequestLocale(locale);

  // Organization schema for NAS & Co.
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: 'NAS & Co.',
    alternateName: 'Nashef, Aun, Shaban & Co.',
    description:
      'A boutique law firm offering specialized legal services for companies, corporations, investors and entrepreneurs.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/images/firm/nas-logo.svg`,
    email: 'info@nas-law.com',
    areaServed: ['Israel', 'International'],
    knowsAbout: [
      'Commercial & Corporate Law',
      'Startups & Venture Capital',
      'Real Estate Law',
      'Commercial Litigation',
      'Tax Law',
      'Employment Law',
    ],
    sameAs: ['https://www.linkedin.com/company/nas-law'],
  };

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <FirmNavbar locale={locale} />
      <main id="main-content">
        <FirmHero locale={locale} />
        <FirmAbout locale={locale} />
        <FirmPracticeAreas locale={locale} />
        <FirmTeamPreview locale={locale} />
        <FirmContact locale={locale} />
      </main>
      <FirmFooter locale={locale} />
    </>
  );
}
