import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

function renderDescription(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trimEnd();
    if (!trimmed) return <div key={i} className="h-3" />;

    // Section headers with emoji at start
    if (/^[🎯💡✅]/.test(trimmed)) {
      return (
        <p key={i} className="font-bold text-navy-900 mt-5 mb-1 text-base">
          {trimmed}
        </p>
      );
    }
    // Numbered items
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <p key={i} className="font-semibold text-navy-800 mt-4 mb-1">
          {trimmed}
        </p>
      );
    }
    // Arrow sub-items
    if (/^\s*→/.test(trimmed)) {
      return (
        <p key={i} className="text-gray-500 font-light pl-6 leading-relaxed">
          {trimmed.trim()}
        </p>
      );
    }
    // Bullet items with 👉 🟢
    if (/^👉|^🟢/.test(trimmed)) {
      return (
        <p key={i} className="text-gray-600 font-light leading-relaxed pl-2">
          {trimmed}
        </p>
      );
    }
    // Bullet •
    if (/^•/.test(trimmed)) {
      return (
        <p key={i} className="font-semibold text-navy-900 mt-4 mb-1">
          {trimmed}
        </p>
      );
    }
    // Default
    return (
      <p key={i} className="text-gray-600 font-light leading-relaxed">
        {trimmed}
      </p>
    );
  });
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((r) => setProduct(r.data))
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: `/products/${id}` } });
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasImg = product.image_url && !imgError;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-navy-900 mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> {t('productDetail.back')}
        </button>

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Image */}
          <div className={`rounded-2xl overflow-hidden flex items-center justify-center ${hasImg ? 'bg-white shadow-md' : `bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-400 to-gray-600'}`}`} style={{ minHeight: '320px' }}>
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
              <span className="text-xs font-medium text-gold-600 bg-gold-50 border border-gold-200 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4 leading-snug">
              {product.name}
            </h1>

            <p className="text-gray-500 font-light leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-end gap-4 mb-4">
              <span className="text-4xl font-bold text-navy-900">
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

        {/* Full description */}
        {product.full_description && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 pb-4 border-b border-gray-100">
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
