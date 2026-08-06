import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/CheckoutClient';
import { COMMERCE_ENABLED } from '@/lib/features';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('checkoutTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }) {
  const { locale } = await params;
  if (!COMMERCE_ENABLED) notFound();
  setRequestLocale(locale);

  return <CheckoutClient />;
}
