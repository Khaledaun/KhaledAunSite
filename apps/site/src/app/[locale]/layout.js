import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Poppins, Cairo } from 'next/font/google';
import { ModalProvider } from '../../context/ModalContext';
import { locales } from '../../i18n/config';
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
  title: 'Khaled Aun - Dispute Resolution & Governance Counsel',
  description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
  keywords: ['dispute resolution', 'governance counsel', 'commercial litigation', 'arbitration', 'conflict prevention', 'cross-border risk', 'business disputes', 'partner conflicts'],
  openGraph: {
    title: 'Khaled Aun - Dispute Resolution & Governance Counsel',
    description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    siteName: 'Khaled Aun',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khaled Aun - Dispute Resolution & Governance Counsel',
    description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
