import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductsServer, getProductTranslationsServer } from '@/services/api';
import ProductsClient from '@/components/ProductsClient';
import { getSeoAlternates } from '@/lib/seo';
import { localizeProducts } from '@/lib/localizeProducts';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
    alternates: getSeoAlternates(locale, '/products'),
  };
}

export default async function ProductsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, translations] = await Promise.all([
    getProductsServer(),
    locale === 'th' ? Promise.resolve([]) : getProductTranslationsServer(locale),
  ]);

  return <ProductsClient products={localizeProducts(products ?? [], translations ?? [])} />;
}
