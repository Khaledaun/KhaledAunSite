import { redirect } from 'next/navigation';

// Redirect /insights to /blog
export default async function InsightsPage({ params: { locale } }) {
  redirect(`/${locale}/blog`);
}

