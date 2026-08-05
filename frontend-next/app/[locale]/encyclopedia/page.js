import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductsServer } from '@/services/api';
import EncyclopediaClient from '@/components/EncyclopediaClient';
import { getSeoAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('encyclopediaTitle'),
    description: t('encyclopediaDescription'),
    alternates: getSeoAlternates(locale, '/encyclopedia'),
  };
}

export default async function EncyclopediaPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = (await getProductsServer()) ?? [];

  return <EncyclopediaClient products={products} />;
}
