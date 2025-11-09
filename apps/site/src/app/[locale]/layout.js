import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Poppins, Cairo } from 'next/font/google';
import { ModalProvider } from '../../context/ModalContext';
import { locales } from '../../i18n/config';
import WebVitalsReporter from '../../components/analytics/WebVitalsReporter';
import '../globals.css';

// Dennis theme-inspired fonts: Poppins for headings, Inter for body
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

// Cairo font for Arabic
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

// Dynamic segments not included in generateStaticParams are generated on demand
export const dynamicParams = true;

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com'),
  title: {
    default: 'Khaled Aun - Legal Strategy & Business Growth',
    template: '%s | Khaled Aun'
  },
  description: 'Expert legal counsel for complex business challenges and growth opportunities. Litigation expert, certified arbitrator, and cross-border legal advisor.',
  keywords: ['legal counsel', 'litigation expert', 'arbitrator', 'business law', 'cross-border legal', 'conflict resolution', 'legal strategy'],
  authors: [{ name: 'Khaled Aun' }],
  creator: 'Khaled Aun',
  publisher: 'Khaled Aun',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com',
    siteName: 'Khaled Aun',
    title: 'Khaled Aun - Legal Strategy & Business Growth',
    description: 'Expert legal counsel for complex business challenges and growth opportunities. Litigation expert, certified arbitrator, and cross-border legal advisor.',
    images: [
      {
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Khaled Aun - Legal Strategy & Business Growth',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@khaledaun',
    creator: '@khaledaun',
    title: 'Khaled Aun - Legal Strategy & Business Growth',
    description: 'Expert legal counsel for complex business challenges and growth opportunities.',
    images: ['/images/og-homepage.jpg'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add your verification tokens when ready)
  // verification: {
  //   google: 'your-google-verification-token',
  //   yandex: 'your-yandex-verification-token',
  // },
};

export default async function LocaleLayout({children, params: {locale}}) {
  if (!locales.includes(locale)) notFound();

  // Import messages directly to ensure they're loaded
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if Arabic fails
    messages = (await import(`../../messages/en.json`)).default;
  }

  return (
    <html 
      dir={locale === 'ar' ? 'rtl' : 'ltr'} 
      lang={locale}
      className={`${inter.variable} ${poppins.variable} ${cairo.variable}`}
    >
      <body className={`${locale === 'ar' ? 'font-cairo' : 'font-poppins'} text-base text-black dark:text-white dark:bg-slate-900`}>
        <WebVitalsReporter />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-gold text-brand-navy px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ModalProvider>
            {children}
          </ModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
