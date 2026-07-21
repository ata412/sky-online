import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Award, Truck, Ticket, ArrowRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getPromotions } from '../services/api';
import HeroCanvas2D from '../components/HeroCanvas2D';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';


function useTypewriter(lines, speed = 70) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState(lines.map(() => ''));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (lineIndex >= lines.length) return;
    const current = lines[lineIndex];
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIndex] = current.slice(0, charIndex + 1);
          return next;
        });
        setCharIndex(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const pause = setTimeout(() => {
        setLineIndex(l => l + 1);
        setCharIndex(0);
      }, 300);
      return () => clearTimeout(pause);
    }
  }, [started, lineIndex, charIndex, lines, speed]);

  const activeLine = lineIndex < lines.length ? lineIndex : lines.length - 1;
  const done = lineIndex >= lines.length;
  return { displayed, activeLine, done };
}

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
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasImg = p.image_url && !imgError;

  return (
    <div
      className="card cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      onClick={() => navigate(`/products/${p.id}`)}
    >
      <div className={`h-48 relative flex items-center justify-center overflow-hidden ${hasImg ? 'bg-white' : `bg-gradient-to-br ${categoryColors[p.category] || 'from-gray-400 to-gray-600'}`}`}>
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
        <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-1 rounded-full">{p.category}</span>
        <h3 className="font-semibold text-navy-900 mt-2 mb-1">{p.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 font-light">{p.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-navy-900">฿{Number(p.price).toLocaleString()}</p>
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

const BANNERS = [
  '/brands/brand-luck/banner.jpg',
  '/brands/dietary-supplement/banner.jpg',
  '/brands/SD%20brand/banner.jpg',
];

function BannerSlideshow() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % BANNERS.length);
        setFading(false);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: '16/4' }}>
      {BANNERS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`banner-${i}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: current === i ? (fading ? 0 : 1) : 0 }}
        />
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold-500 w-5' : 'bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const features = [
    { icon: Award, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Truck, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Ticket, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
  ];

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
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={sectionRef}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`animate-fade-up ${i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''} group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 hover:border-gold-300 hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              <div className="w-20 h-20 bg-gold-50 group-hover:bg-gold-100 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                <Icon size={36} className="text-gold-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const heroLines = useMemo(() => [t('home.heroTitle1'), t('home.heroTitle2')], [t]);
  const { displayed, activeLine, done } = useTypewriter(heroLines, 70);

  useEffect(() => {
    getProducts({ featured: 'true' }).then((r) => setProducts(r.data)).catch(() => {});
    getPromotions().then((r) => setPromotions(r.data.slice(0, 2))).catch(() => {});
  }, []);


  return (
    <div>
      {/* Hero */}
      <section className="relative bg-hero-gradient min-h-[88vh] flex items-center overflow-hidden">
        <HeroCanvas2D />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <img
              src="/sky_online_logo.png"
              alt="Sky Online"
              className="h-12 sm:h-16 w-auto object-contain mb-6"
            />
            <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-600/40 rounded-full px-4 py-1.5 mb-6">
              <Star size={14} className="text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">{t('home.badge')}</span>
            </div>
            <h1 className={`text-5xl sm:text-6xl font-bold text-white mb-6${done ? ' hero-bounce' : ''}`}>
              <span className="block">
                {displayed[0]}
                {activeLine === 0 && !done && <span className="typewriter-cursor text-white" />}
              </span>
              <span className="block mt-6 text-gold-400">
                {displayed[1]}
                {activeLine === 1 && !done && <span className="typewriter-cursor text-gold-400" />}
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-10">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-gold flex items-center gap-2">
                {t('home.viewAllProducts')} <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline-gold">
                {t('home.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Slideshow */}
      <BannerSlideshow />

      {/* Features */}
      <FeaturesSection />

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">{t('home.featuredProducts')}</h2>
                <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
              </div>
              <Link to="/products" className="text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 text-sm">
                {t('home.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <TiltCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">{t('home.specialPromos')}</h2>
                <p className="section-subtitle">{t('home.promoSubtitle')}</p>
              </div>
              <Link to="/promotions" className="text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 text-sm">
                {t('home.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-white">
                  <div className="absolute top-4 right-4 bg-gold-500 text-navy-900 font-bold text-xl rounded-full w-16 h-16 flex items-center justify-center">
                    -{promo.discount_percent}%
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold-400">{promo.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{promo.description}</p>
                  {promo.original_price && (
                    <div className="flex items-center gap-3">
                      <span className="line-through text-gray-500">฿{Number(promo.original_price).toLocaleString()}</span>
                      <span className="text-2xl font-bold text-white">฿{Number(promo.sale_price).toLocaleString()}</span>
                    </div>
                  )}
                  <Link to="/promotions" className="mt-4 inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm font-medium">
                    {t('home.claimPromo')} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gold-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-gold-100 mb-8 max-w-xl mx-auto">
            {t('home.ctaDesc')}
          </p>
          <Link
            to="/contact"
            className="bg-white text-gold-700 hover:bg-gold-50 font-bold px-8 py-4 rounded-xl text-lg inline-flex items-center gap-2 transition-colors shadow-lg"
          >
            {t('home.ctaBtn')} <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
