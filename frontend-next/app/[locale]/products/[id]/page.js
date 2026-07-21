import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductServer } from '@/services/api';
import ProductDetailTop from '@/components/ProductDetailTop';

function renderDescription(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trimEnd();
    if (!trimmed) return <div key={i} className="h-3" />;

    // Section headers with emoji at start
    if (/^[🎯💡✅]/.test(trimmed)) {
      return (
        <p key={i} className="font-bold text-navy-900 dark:text-white mt-5 mb-1 text-base">
          {trimmed}
        </p>
      );
    }
    // Numbered items
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <p key={i} className="font-semibold text-navy-800 dark:text-gray-200 mt-4 mb-1">
          {trimmed}
        </p>
      );
    }
    // Arrow sub-items
    if (/^\s*→/.test(trimmed)) {
      return (
        <p key={i} className="text-gray-500 dark:text-gray-400 font-light pl-6 leading-relaxed">
          {trimmed.trim()}
        </p>
      );
    }
    // Bullet items with 👉 🟢
    if (/^👉|^🟢/.test(trimmed)) {
      return (
        <p key={i} className="text-gray-600 dark:text-gray-300 font-light leading-relaxed pl-2">
          {trimmed}
        </p>
      );
    }
    // Bullet •
    if (/^•/.test(trimmed)) {
      return (
        <p key={i} className="font-semibold text-navy-900 dark:text-white mt-4 mb-1">
          {trimmed}
        </p>
      );
    }
    // Default
    return (
      <p key={i} className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
        {trimmed}
      </p>
    );
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductServer(id);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
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
  const product = await getProductServer(id);
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
            <div className="space-y-1">
              {renderDescription(product.full_description)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
