import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { getProductsServer, getPromotionsServer } from '@/services/api';
import HeroContent from '@/components/HeroContent';
import BannerSlideshow from '@/components/BannerSlideshow';
import FeaturesSection from '@/components/FeaturesSection';
import HomeProductsGrid from '@/components/HomeProductsGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const [products, promotionsAll] = await Promise.all([
    getProductsServer({ featured: 'true' }),
    getPromotionsServer(),
  ]);
  const promotions = (promotionsAll ?? []).slice(0, 2);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-hero-gradient min-h-[88vh] flex items-center overflow-hidden">
        <img
          src="/hero-cityscape.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900/85" />
        <HeroContent />
      </section>

      {/* Banner Slideshow */}
      <BannerSlideshow />

      {/* Features */}
      <FeaturesSection />

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">{t('home.featuredProducts')}</h2>
                <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
              </div>
              <Link href="/products" className="text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 text-sm">
                {t('home.viewAll')} <ArrowRight size={16} />
              </Link>
            </div>
            <HomeProductsGrid products={products} />
          </div>
        </section>
      )}

      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <section className="py-16 bg-white dark:bg-navy-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">{t('home.specialPromos')}</h2>
                <p className="section-subtitle">{t('home.promoSubtitle')}</p>
              </div>
              <Link href="/promotions" className="text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 text-sm">
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
                  <Link href="/promotions" className="mt-4 inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm font-medium">
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
            href="/contact"
            className="bg-white text-gold-700 hover:bg-gold-50 font-bold px-8 py-4 rounded-xl text-lg inline-flex items-center gap-2 transition-colors shadow-lg"
          >
            {t('home.ctaBtn')} <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
