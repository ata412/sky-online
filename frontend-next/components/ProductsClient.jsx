'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { COMMERCE_ENABLED } from '@/lib/features';

const BRANDS = [
  { key: 'BRAND LUCK', banner: '/brands/brand-luck/banner.jpg', alt: 'BRAND LUCK Banner' },
  { key: 'Dietary Supplement', banner: '/brands/dietary-supplement/banner.jpg', alt: 'Dietary Supplement Banner' },
  { key: 'BRAND Houluk Seam', banner: '/brands/houluk-seam/banner.jpg', alt: 'BRAND Houluk Seam Banner' },
  { key: 'BRAND SD', banner: '/brands/SD%20brand/banner.jpg', alt: 'BRAND SD Banner' },
];

const categoryColors = {
  'วิตามิน': 'from-blue-400 to-blue-600',
  'โปรตีน': 'from-orange-400 to-orange-600',
  'ความงาม': 'from-pink-400 to-pink-600',
  'ย่อยอาหาร': 'from-green-400 to-green-600',
  'กระดูก': 'from-purple-400 to-purple-600',
  'ไฟเบอร์': 'from-yellow-400 to-lime-500',
  'กาแฟ': 'from-amber-700 to-yellow-900',
  'ช็อกโกแลต': 'from-amber-800 to-brown-900',
};
const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'ความงาม': '✨', 'ย่อยอาหาร': '🌱',
  'กระดูก': '🦴', 'ไฟเบอร์': '🍍', 'กาแฟ': '☕', 'ช็อกโกแลต': '🍫',
};

function ProductCard({ product }) {
  const t = useTranslations();
  const { addToCart } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasImage = product.image_url && !imgError;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div
        className={`relative flex h-48 cursor-pointer items-center justify-center overflow-hidden ${
          hasImage
            ? 'bg-white dark:bg-navy-800'
            : `bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-400 to-gray-600'}`
        }`}
        onClick={() => router.push(`/products/${product.id}`)}
      >
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain p-3"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-6xl">{categoryEmojis[product.category] || '🌿'}</span>
        )}
        {product.pv > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-gold-400">
            {product.pv} PV
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <span className="w-fit rounded-full bg-gold-50 px-2 py-1 text-xs font-medium text-gold-600 dark:bg-navy-800 dark:text-gold-400">
          {product.category}
        </span>
        <h3
          className="mb-1 mt-2 cursor-pointer font-semibold text-navy-900 transition-colors hover:text-gold-600 dark:text-white dark:hover:text-gold-400"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="line-clamp-3 flex-grow text-sm font-light text-gray-500 dark:text-gray-400">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-navy-800">
          <div>
            <p className="text-xl font-bold text-navy-900 dark:text-white">฿{Number(product.price).toLocaleString()}</p>
          </div>
          {COMMERCE_ENABLED && (
            <button
              onClick={handleAdd}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                added ? 'bg-green-500 text-white' : 'btn-gold'
              }`}
            >
              {added ? t('products.added') : t('products.addToCart')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandSection({ brand, products, search }) {
  const sectionRef = useRef(null);
  const filtered = products.filter((product) =>
    !search || product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <section ref={sectionRef} id={`brand-${brand.key.replace(/\s+/g, '-')}`}>
      <div className="w-full overflow-hidden bg-navy-900">
        <img
          src={brand.banner}
          alt={brand.alt}
          className="max-h-[340px] w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductsClient({ products }) {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const [activeBrand, setActiveBrand] = useState(null);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setBarHidden(y > lastY && y > 40);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBrand = (brandKey) => {
    setActiveBrand(brandKey);
    document
      .getElementById(`brand-${brandKey.replace(/\s+/g, '-')}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <div
        className="sticky top-[var(--navbar-offset,4rem)] z-30 border-b border-gray-100 bg-white shadow-sm transition-[top,transform] duration-300 dark:border-navy-800 dark:bg-navy-900"
        style={{ transform: barHidden ? 'translateY(calc(-100% - 4rem))' : 'translateY(0)' }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:px-6 lg:px-8">
          <div className="relative w-full flex-grow sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
            />
          </div>
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
            {BRANDS.map((brand) => (
              <button
                key={brand.key}
                onClick={() => scrollToBrand(brand.key)}
                className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeBrand === brand.key
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-navy-900 hover:text-navy-900 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:border-gold-500 dark:hover:text-gold-400'
                }`}
              >
                {brand.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {BRANDS.map((brand) => (
        <BrandSection
          key={brand.key}
          brand={brand}
          products={products.filter((product) => product.brand === brand.key)}
          search={search}
        />
      ))}
    </div>
  );
}
