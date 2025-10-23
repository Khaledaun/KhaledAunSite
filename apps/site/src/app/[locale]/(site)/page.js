import Navbar from '@/components/site/Navbar';
import HeroDennis from '@/components/site/HeroDennis';
import AboutDennis from '@/components/site/AboutDennis';
import ServicesDennis from '@/components/site/ServicesDennis';
import ExperienceTimelineDennis from '@/components/site/ExperienceTimelineDennis';
import LinkedInSection from '@/components/site/LinkedInSection';
import BlogPreview from '@/components/site/BlogPreview';
import ContactDennis from '@/components/site/ContactDennis';
import VenturesStrip from '@/components/site/VenturesStrip';
import FooterDennis from '@/components/site/FooterDennis';
import Switcher from '@/components/site/Switcher';
import ConsultationModal from '@/components/common/ConsultationModal';
import Script from 'next/script';

// Force dynamic rendering to ensure locale is determined at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home({params: {locale}}) {
  
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Khaled Aun',
    description: 'Expert legal counsel for complex business challenges and growth opportunities.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Legal Consultation',
      email: 'consultation@khaledaun.com'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US'
    },
    sameAs: [
      'https://linkedin.com/in/khaledaun'
    ]
  };

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd)
        }}
      />
      <Navbar locale={locale} />
      <main id="main-content">
        <HeroDennis locale={locale} />
        <AboutDennis />
        <ServicesDennis />
        <ExperienceTimelineDennis />
        <LinkedInSection />
        <BlogPreview locale={locale} />
        <VenturesStrip />
        <ContactDennis />
      </main>
      <FooterDennis locale={locale} />
      <Switcher />
      <ConsultationModal />
    </>
  );
}