import { unstable_setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/site/Navbar';
import HeroDennis from '@/components/site/HeroDennis';
import AboutDennis from '@/components/site/AboutDennis';
import ServicesDennis from '@/components/site/ServicesDennis';
import ProcessSection from '@/components/site/ProcessSection';
import SelectedMatters from '@/components/site/SelectedMatters';
import CredentialsTimeline from '@/components/site/CredentialsTimeline';
import BlogPreview from '@/components/site/BlogPreview';
import ContactDennis from '@/components/site/ContactDennis';
import FooterDennis from '@/components/site/FooterDennis';
import Switcher from '@/components/site/Switcher';
import ConsultationModal from '@/components/common/ConsultationModal';
import Script from 'next/script';

// Force dynamic rendering to ensure correct locale is used
export const dynamic = 'force-dynamic';

export default function Home({params: {locale}}) {
  unstable_setRequestLocale(locale);

  // Person schema for dispute resolution specialist
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Khaled Aun',
    jobTitle: 'Dispute Resolution & Governance Counsel',
    description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/images/hero/khaled-portrait.jpg`,
    email: 'contact@khaledaun.com',
    knowsAbout: [
      'Dispute Resolution',
      'Commercial Litigation',
      'Arbitration',
      'Corporate Governance',
      'Cross-Border Business Risk',
      'Conflict Prevention'
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Dispute Resolution & Governance Counsel',
      occupationalCategory: 'Legal Services',
      description: 'Resolving high-stakes business disputes and preventing escalation through clear strategy and decisive execution.'
    },
    sameAs: [
      'https://linkedin.com/in/khaledaun'
    ]
  };

  // Professional service schema
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Khaled Aun - Dispute Resolution & Governance Counsel',
    description: 'Dispute resolution, governance advisory, and commercial strategy for founders, partners, and businesses.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    priceRange: '$$$$',
    serviceType: [
      'Dispute Resolution',
      'Governance Advisory',
      'Commercial Litigation',
      'Cross-Border Risk Management'
    ],
    areaServed: {
      '@type': 'Country',
      name: 'International'
    }
  };

  return (
    <>
      <Script
        id="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd)
        }}
      />
      <Script
        id="service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd)
        }}
      />
      <Navbar locale={locale} />
      <main id="main-content">
        <HeroDennis locale={locale} />
        <AboutDennis locale={locale} />
        <ServicesDennis locale={locale} />
        <ProcessSection locale={locale} />
        <SelectedMatters locale={locale} />
        <CredentialsTimeline locale={locale} />
        <BlogPreview locale={locale} />
        <ContactDennis locale={locale} />
      </main>
      <FooterDennis locale={locale} />
      <Switcher />
      <ConsultationModal />
    </>
  );
}
