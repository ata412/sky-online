'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';

const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'ความงาม': '✨',
  'ย่อยอาหาร': '🌱', 'กระดูก': '🦴', 'ไฟเบอร์': '🍍',
  'กาแฟ': '☕', 'ช็อกโกแลต': '🍫',
};
const categoryColors = {
  'วิตามิน': 'from-blue-400 to-blue-600',
  'โปรตีน': 'from-orange-400 to-orange-600',
  'ความงาม': 'from-pink-400 to-pink-600',
  'ย่อยอาหาร': 'from-green-400 to-green-600',
  'กระดูก': 'from-purple-400 to-purple-600',
  'ไฟเบอร์': 'from-yellow-400 to-lime-500',
  'กาแฟ': 'from-amber-700 to-yellow-900',
  'ช็อกโกแลต': 'from-amber-800 to-amber-950',
};

export default function ProductDetailTop({ product }) {
  const t = useTranslations();
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasImg = product.image_url && !imgError;

  return (
    <>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-navy-900 dark:hover:text-white mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> {t('productDetail.back')}
      </button>

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Image */}
        <div className={`self-start rounded-2xl overflow-hidden flex items-center justify-center ${hasImg ? 'bg-white dark:bg-navy-800 shadow-md' : `bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-400 to-gray-600'}`}`} style={{ minHeight: '320px' }}>
          {hasImg ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-6 max-h-96"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-9xl">{categoryEmojis[product.category] || '🌿'}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-navy-900 text-gold-400 px-3 py-1 rounded-full">
              {product.brand}
            </span>
            <span className="text-xs font-medium text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-navy-800 border border-gold-200 dark:border-navy-700 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mb-4 leading-snug">
            {product.name}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-6 whitespace-pre-line">
            {product.description}
          </p>

          <div className="flex items-end gap-4 mb-4">
            <span className="text-4xl font-bold text-navy-900 dark:text-white">
              ฿{Number(product.price).toLocaleString()}
            </span>
            {product.pv > 0 && (
              <span className="mb-1 bg-gold-100 text-gold-700 font-bold text-sm px-3 py-1 rounded-full">
                {product.pv} PV
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-8">{t('productDetail.stock', { count: product.stock })}</p>

          <button
            onClick={handleAdd}
            className={`flex items-center justify-center gap-2 py-3 px-8 rounded-xl text-base font-semibold transition-all duration-200 shadow-md ${
              added
                ? 'bg-green-500 text-white shadow-green-200'
                : 'btn-gold'
            }`}
          >
            {added ? (
              <><CheckCircle size={20} /> {t('productDetail.addedToCart')}</>
            ) : (
              <><ShoppingCart size={20} /> {t('productDetail.addToCart')}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
