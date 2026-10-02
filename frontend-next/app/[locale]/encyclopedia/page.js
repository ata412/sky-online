import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductsServer, getProductTranslationsServer, getProductTranslationServer } from '@/services/api';
import EncyclopediaClient from '@/components/EncyclopediaClient';
import { getSeoAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function getFullTranslationWithRetry(id, locale) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await getProductTranslationServer(id, locale);
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('encyclopediaTitle'),
    description: t('encyclopediaDescription'),
    alternates: getSeoAlternates(locale, '/encyclopedia'),
  };
}

export default async function EncyclopediaPage({ params, searchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const [products, productTranslations] = await Promise.all([
    getProductsServer(),
    locale === 'th' ? Promise.resolve([]) : getProductTranslationsServer(locale),
  ]);
  const speechManifestMode = query?.speech_manifest === '1';
  const fullProductTranslations = [];
  if (speechManifestMode && locale === 'lo' && products?.length) {
    let nextIndex = 0;
    await Promise.all(Array.from({ length: Math.min(3, products.length) }, async () => {
      while (nextIndex < products.length) {
        const index = nextIndex++;
        fullProductTranslations[index] = {
          product_id: products[index].id,
          ...await getFullTranslationWithRetry(products[index].id, locale),
        };
      }
    }));
  }

  return (
    <EncyclopediaClient
      products={products ?? []}
      productTranslations={productTranslations ?? []}
      fullProductTranslations={fullProductTranslations}
      speechManifestMode={speechManifestMode}
    />
  );
}
