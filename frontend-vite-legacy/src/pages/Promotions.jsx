import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Calendar, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPromotions } from '../services/api';

const promoGradients = [
  'from-navy-800 to-navy-900',
  'from-blue-800 to-blue-900',
  'from-purple-800 to-purple-900',
  'from-emerald-800 to-emerald-900',
];

export default function Promotions() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromotions()
      .then((r) => setPromotions(r.data))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">{t('promotions.title')}</h1>
        <p className="section-subtitle">{t('promotions.subtitle')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-64" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t('promotions.noPromos')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo, idx) => (
            <div
              key={promo.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promoGradients[idx % promoGradients.length]} p-8 text-white`}
            >
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/5 rounded-full" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-gold-400" />
                    <span className="text-gold-400 text-sm font-medium">{t('promotions.special')}</span>
                  </div>
                  <div className="bg-gold-500 text-navy-900 font-extrabold text-2xl rounded-full w-18 h-18 w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span>-{promo.discount_percent}%</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">{promo.title}</h2>
                <p className="text-gray-300 text-sm mb-5 leading-relaxed">{promo.description}</p>

                {promo.original_price && (
                  <div className="flex items-center gap-4 mb-5 p-4 bg-white/10 rounded-xl">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">{t('promotions.regularPrice')}</p>
                      <p className="line-through text-gray-400 font-semibold">
                        ฿{Number(promo.original_price).toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400" />
                    <div className="text-center">
                      <p className="text-xs text-gold-400">{t('promotions.salePrice')}</p>
                      <p className="text-2xl font-bold text-white">
                        ฿{Number(promo.sale_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {(promo.start_date || promo.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <Calendar size={14} />
                    <span>
                      {formatDate(promo.start_date)} – {formatDate(promo.end_date)}
                    </span>
                  </div>
                )}

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {t('promotions.claimPromo')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gold-50 border border-gold-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Tag size={24} className="text-gold-600" />
          <div>
            <p className="font-semibold text-navy-900">{t('promotions.newsletterTitle')}</p>
            <p className="text-sm text-gray-500">{t('promotions.newsletterDesc')}</p>
          </div>
        </div>
        <Link to="/contact" className="btn-gold flex-shrink-0">
          {t('promotions.newsletterBtn')}
        </Link>
      </div>
    </div>
  );
}
