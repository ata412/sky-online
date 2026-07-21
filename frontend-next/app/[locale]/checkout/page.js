import { getTranslations, setRequestLocale } from 'next-intl/server';
import CheckoutClient from '@/components/CheckoutClient';

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
  setRequestLocale(locale);

  return <CheckoutClient />;
}
