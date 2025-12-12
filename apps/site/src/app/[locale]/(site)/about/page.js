import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Navbar from '@/components/site/Navbar';
import FooterDennis from '@/components/site/FooterDennis';

export async function generateMetadata({params: {locale}}) {
  const t = await getTranslations('About');
  return {
    title: 'About Khaled Aun - Dispute Resolution & Governance Counsel',
    description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
    openGraph: {
      title: 'About Khaled Aun - Dispute Resolution & Governance Counsel',
      description: 'I help founders, partners, and businesses resolve high-stakes disputes and prevent escalation — with clear strategy and decisive execution.',
    },
  };
}

export default async function AboutPage({params: {locale}}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('About');

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content">
        <section className="min-h-screen bg-white dark:bg-slate-900 pt-28 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              {/* Identity badge */}
              <div className="inline-block mb-4 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                <span className="text-brand-gold font-medium text-sm">{t('role')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-slate-800 dark:text-white">
                {t('title')}
              </h1>

              {/* Philosophy narrative */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-xl text-slate-700 dark:text-slate-300 mb-6 font-medium leading-relaxed">
                  {t('description')}
                </p>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {t('experience')}
                </p>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {t('philosophy')}
                </p>

                {/* What I'm Not */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-brand-gold p-6 rounded-r-lg mb-10">
                  <p className="text-slate-700 dark:text-slate-300 text-lg italic m-0">
                    "{t('whatImNot')}"
                  </p>
                </div>

                {/* Background */}
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mt-12 mb-6">
                  Background
                </h2>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  My foundation is in commercial litigation — years spent in high-stakes courtrooms,
                  understanding how disputes unfold, what drives them, and how to resolve them efficiently.
                  This background shapes how I approach every matter: with the discipline of someone
                  who has seen what happens when conflicts escalate, and the strategic clarity to prevent that.
                </p>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  I hold a law degree from The Hebrew University of Jerusalem, am certified in mediation
                  and arbitration by the Israel Bar Association, and am currently pursuing the CIArb pathway
                  to deepen my expertise in international arbitration.
                </p>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  I work in English, Hebrew, and Arabic — serving clients across jurisdictions
                  with clarity and precision.
                </p>

                {/* Other Ventures */}
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mt-12 mb-6">
                  {t('otherVentures')}
                </h2>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {t('otherVenturesDesc')}
                </p>

                {/* CTA */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                    If you're facing a situation that requires clarity, strategy, and decisive action,
                    I'd welcome the conversation.
                  </p>
                  <Link
                    href="/#contact"
                    className="btn bg-brand-gold hover:bg-brand-gold/90 border-brand-gold text-white rounded-md inline-block"
                  >
                    {t('contactCTA')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterDennis locale={locale} />
    </>
  );
}
