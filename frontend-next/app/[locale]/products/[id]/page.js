import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getProductServer, getProductTranslationServer } from '@/services/api';
import ProductDetailTop from '@/components/ProductDetailTop';
import ProductDescription from '@/components/ProductDescription';
import { getSeoAlternates } from '@/lib/seo';
import { localizeProduct } from '@/lib/localizeProducts';

const loadLocalizedProduct = cache(async (id, locale) => {
  const product = await getProductServer(id);
  if (!product || locale === 'th') return product;
  const translation = await getProductTranslationServer(id, locale);
  return localizeProduct(product, translation);
});

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const product = await loadLocalizedProduct(id, locale);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    alternates: getSeoAlternates(locale, `/products/${id}`),
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const product = await loadLocalizedProduct(id, locale);
  if (!product) notFound();

  return (
    <div className="bg-gray-50 dark:bg-navy-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailTop product={product} />

        {/* Full description */}
        {product.full_description && (
          <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-navy-800">
              {t('productDetail.productDetails')}
            </h2>
            <ProductDescription text={product.full_description} />
          </div>
        )}
      </div>
    </div>
  );
}
