'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ShoppingCart, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { COMMERCE_ENABLED } from '@/lib/features';
import ProductDescription from '@/components/ProductDescription';

const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'อาหารเสริม': '✨',
  'ย่อยอาหาร': '🌱', 'กระดูก': '🦴', 'ไฟเบอร์': '🍍',
  'กาแฟ': '☕', 'ช็อกโกแลต': '🍫',
};
const categoryColors = {
  'วิตามิน': 'from-blue-400 to-blue-600',
  'โปรตีน': 'from-orange-400 to-orange-600',
  'อาหารเสริม': 'from-pink-400 to-pink-600',
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productId = Number(product.id);
  const galleryImages = [
    product.image_url,
    ...(
      productId >= 9 && productId <= 19
        ? [1, 2, 3].map((number) => `/products/gallery/${productId}/${number}.jpg`)
        : []
    ),
  ].filter(Boolean);
  const availableImages = galleryImages.filter((image) => !failedImages.has(image));
  const activeImage = availableImages[selectedImage] || availableImages[0];
  const hasImg = Boolean(activeImage);

  const selectImage = (index) => {
    setSelectedImage(index);
  };

  const moveImage = (direction) => {
    if (availableImages.length < 2) return;
    selectImage((selectedImage + direction + availableImages.length) % availableImages.length);
  };

  const handleImageError = () => {
    if (!activeImage) return;
    setFailedImages((previous) => new Set([...previous, activeImage]));
    setSelectedImage(0);
  };

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
        <div className="self-start space-y-3">
          <div className={`group relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl ${hasImg ? 'bg-white shadow-md dark:bg-navy-800' : `bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-400 to-gray-600'}`}`}>
            {hasImg ? (
              <img
                src={activeImage}
                alt={`${product.name} ${selectedImage + 1}`}
                className="h-full max-h-[520px] w-full object-contain p-4"
                onError={handleImageError}
              />
            ) : (
              <span className="text-9xl">{categoryEmojis[product.category] || '🌿'}</span>
            )}
            {availableImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  aria-label="ภาพก่อนหน้า"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900/75 text-white opacity-0 shadow-md transition-opacity hover:bg-navy-900 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  aria-label="ภาพถัดไป"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900/75 text-white opacity-0 shadow-md transition-opacity hover:bg-navy-900 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {availableImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2" aria-label="ภาพสินค้าทั้งหมด">
              {availableImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => selectImage(index)}
                  aria-label={`ดูภาพสินค้า ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors dark:bg-navy-800 ${
                    selectedImage === index
                      ? 'border-gold-500'
                      : 'border-transparent hover:border-gold-300 dark:hover:border-gold-700'
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full rounded-lg object-contain"
                    onError={() => {
                      setFailedImages((previous) => new Set([...previous, image]));
                      setSelectedImage(0);
                    }}
                  />
                </button>
              ))}
            </div>
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

          <div className="mb-7 rounded-xl border border-gray-100 bg-white/70 p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900/60">
            <ProductDescription text={product.description} compact />
          </div>

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

          {COMMERCE_ENABLED && (
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
          )}
        </div>
      </div>
    </>
  );
}
