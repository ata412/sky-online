'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';

const categoryColors = {
  'วิตามิน': 'from-blue-400 to-blue-600',
  'โปรตีน': 'from-orange-400 to-orange-600',
  'ความงาม': 'from-pink-400 to-pink-600',
  'ย่อยอาหาร': 'from-green-400 to-green-600',
  'กระดูก': 'from-purple-400 to-purple-600',
};
const categoryEmojis = {
  'วิตามิน': '💊', 'โปรตีน': '💪', 'ความงาม': '✨', 'ย่อยอาหาร': '🌱', 'กระดูก': '🦴',
};

function TiltCard({ p }) {
  const t = useTranslations();
  const { addToCart } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasImg = p.image_url && !imgError;

  return (
    <div
      className="card cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      onClick={() => router.push(`/products/${p.id}`)}
    >
      <div className={`h-48 relative flex items-center justify-center overflow-hidden ${hasImg ? 'bg-white dark:bg-navy-800' : `bg-gradient-to-br ${categoryColors[p.category] || 'from-gray-400 to-gray-600'}`}`}>
        {hasImg ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="w-full h-full object-contain p-3"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-6xl">{categoryEmojis[p.category] || '🌿'}</span>
        )}
        {p.pv > 0 && (
          <span className="absolute top-2 right-2 bg-navy-900 text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {p.pv} PV
          </span>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-navy-800 px-2 py-1 rounded-full">{p.category}</span>
        <h3 className="font-semibold text-navy-900 dark:text-white mt-2 mb-1">{p.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 font-light">{p.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-navy-900 dark:text-white">฿{Number(p.price).toLocaleString()}</p>
          <button
            type="button"
            onClick={handleAdd}
            className={`text-sm py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${added ? 'bg-green-500 text-white' : 'btn-gold'}`}
          >
            {added ? t('home.added') : t('home.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeProductsGrid({ products }) {
  const cardRefs = useRef([]);

  const observe = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return observer;
  }, []);

  useEffect(() => {
    const observer = observe();
    return () => observer.disconnect();
  }, [observe]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => (cardRefs.current[i] = el)}
          className="animate-fade-up"
          style={{ transitionDelay: `${(i % 3) * 100}ms` }}
        >
          <TiltCard p={p} />
        </div>
      ))}
    </div>
  );
}
