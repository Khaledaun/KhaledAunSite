import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

// Redirect /insights to /blog
export default async function InsightsPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);
  redirect(`/${locale}/blog`);
}

