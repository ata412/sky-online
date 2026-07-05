import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BRANDS = [
  {
    key: 'BRAND LUCK',
    banner: '/brands/brand-luck/banner.jpg',
    alt: 'BRAND LUCK Banner',
  },
  {
    key: 'Dietary Supplement',
    banner: '/brands/dietary-supplement/banner.jpg',
    alt: 'Dietary Supplement Banner',
  },
  {
    key: 'BRAND Houluk Seam',
    banner: '/brands/houluk-seam/banner.jpg',
    alt: 'BRAND Houluk Seam Banner',
  },
  {
    key: 'BRAND SD',
    banner: '/brands/SD%20brand/banner.jpg',
    alt: 'BRAND SD Banner',
  },
];

const categoryColors = {
  'วิตามิน':    'from-blue-400 to-blue-600',
  'โปรตีน':    'from-orange-400 to-orange-600',
  'ความงาม':   'from-pink-400 to-pink-600',
  'ย่อยอาหาร':  'from-green-400 to-green-600',
  'กระดูก':    'from-purple-400 to-purple-600',
  'ไฟเบอร์':   'from-yellow-400 to-lime-500',
  'กาแฟ':     'from-amber-700 to-yellow-900',
  'ช็อกโกแลต': 'from-amber-800 to-brown-900',
};
const categoryEmojis = {
  'วิตามิน':    '💊',
  'โปรตีน':    '💪',
  'ความงาม':   '✨',
  'ย่อยอาหาร':  '🌱',
  'กระดูก':    '🦴',
  'ไฟเบอร์':   '🍍',
  'กาแฟ':     '☕',
  'ช็อกโกแลต': '🍫',
};

function ProductCard({ p }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasImage = p.image_url && !imgError;

  return (
    <div className="card flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div
        className={`h-48 relative overflow-hidden cursor-pointer ${hasImage ? 'bg-white' : `bg-gradient-to-br ${categoryColors[p.category] || 'from-gray-400 to-gray-600'}`} flex items-center justify-center`}
        onClick={() => navigate(`/products/${p.id}`)}
      >
        {hasImage ? (
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

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-1 rounded-full w-fit">
          {p.category}
        </span>
        <h3
          className="font-semibold text-navy-900 mt-2 mb-1 cursor-pointer hover:text-gold-600 transition-colors"
          onClick={() => navigate(`/products/${p.id}`)}
        >
          {p.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 flex-grow font-light">{p.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-navy-900">฿{Number(p.price).toLocaleString()}</p>
            <p className="text-xs text-gray-400">{t('products.stock', { count: p.stock })}</p>
          </div>
          <button
            onClick={handleAdd}
            className={`py-2 px-4 text-sm rounded-lg font-semibold transition-all duration-200 ${
              added ? 'bg-green-500 text-white' : 'btn-gold'
            }`}
          >
            {added ? t('products.added') : t('products.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandSection({ brand, products, search }) {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <section ref={sectionRef} id={`brand-${brand.key.replace(/\s+/g, '-')}`}>
      {/* Banner */}
      <div className="w-full overflow-hidden bg-navy-900">
        <img
          src={brand.banner}
          alt={brand.alt}
          className="w-full object-cover max-h-[340px]"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-10">{t('products.noProductsInBrand')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(null);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    getProducts()
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

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
    const el = document.getElementById(`brand-${brandKey.replace(/\s+/g, '-')}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const byBrand = (brandKey) => products.filter((p) => p.brand === brandKey);

  return (
    <div>
      {/* Sticky header: search + brand tabs */}
      <div
        className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm transition-transform duration-300"
        style={{ transform: barHidden ? 'translateY(calc(-100% - 4rem))' : 'translateY(0)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-grow w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
            />
          </div>

          {/* Brand jump tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {BRANDS.map((b) => (
              <button
                key={b.key}
                onClick={() => scrollToBrand(b.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeBrand === b.key
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-navy-900 hover:text-navy-900'
                }`}
              >
                {b.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand sections */}
      {loading ? (
        <>
          {BRANDS.map((b) => (
            <div key={b.key}>
              <div className="w-full h-48 bg-gray-200 animate-pulse" />
              <SkeletonGrid />
            </div>
          ))}
        </>
      ) : (
        BRANDS.map((b) => (
          <BrandSection
            key={b.key}
            brand={b}
            products={byBrand(b.key)}
            search={search}
          />
        ))
      )}
    </div>
  );
}
