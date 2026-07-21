import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductsServer } from '@/services/api';
import ProductsClient from '@/components/ProductsClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
  };
}

export default async function ProductsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = (await getProductsServer()) ?? [];

  return <ProductsClient products={products} />;
}
