'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Instagram, Youtube, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations();

  const quickLinks = [
    { to: '/', label: t('footer.quickLinkItems.home') },
    { to: '/products', label: t('footer.quickLinkItems.products') },
    { to: '/promotions', label: t('footer.quickLinkItems.promotions') },
    { to: '/vision', label: t('footer.quickLinkItems.vision') },
    { to: '/activities', label: t('footer.quickLinkItems.activities') },
    { to: '/hall-of-fame', label: t('footer.quickLinkItems.hallOfFame') },
  ];

  return (
    <footer className="bg-navy-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="mb-4">
              <img src="/sky_online.png" alt="Sky Online" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3 mt-4">
              <button type="button" className="w-9 h-9 bg-navy-700 hover:bg-gold-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </button>
              <button type="button" className="w-9 h-9 bg-navy-700 hover:bg-gold-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </button>
              <button type="button" className="w-9 h-9 bg-navy-700 hover:bg-gold-600 rounded-full flex items-center justify-center transition-colors">
                <Youtube size={16} />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-gold-400 font-semibold mb-4 text-base">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-gray-400 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-navy-700 pt-8">
          <div className="mb-4 flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 flex-shrink-0 text-gold-500" />
            <div>
              <h4 className="font-semibold text-gold-400">บริษัท สกาย ออนไลน์ กรุ๊ป จำกัด</h4>
              <p className="mt-1 text-sm text-gray-400">
                28/15 ตำบลบึงคำพร้อย อำเภอลำลูกกา ปทุมธานี 12150
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-navy-700">
            <iframe
              title="แผนที่บริษัท สกาย ออนไลน์ กรุ๊ป จำกัด"
              src="https://maps.google.com/maps?q=%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%A9%E0%B8%B1%E0%B8%97+%E0%B8%AA%E0%B8%81%E0%B8%B2%E0%B8%A2+%E0%B8%AD%E0%B8%AD%E0%B8%99%E0%B9%84%E0%B8%A5%E0%B8%99%E0%B9%8C+%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B9%8A%E0%B8%9B+%E0%B8%88%E0%B8%B3%E0%B8%81%E0%B8%B1%E0%B8%94+28%2F15+%E0%B8%95%E0%B8%B3%E0%B8%9A%E0%B8%A5+%E0%B8%9A%E0%B8%B6%E0%B8%87%E0%B8%84%E0%B8%B3%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A2+%E0%B8%AD%E0%B8%B3%E0%B9%80%E0%B8%A0%E0%B8%AD%E0%B8%A5%E0%B8%B3%E0%B8%A5%E0%B8%B9%E0%B8%81%E0%B8%81%E0%B8%B2+%E0%B8%9B%E0%B8%97%E0%B8%B8%E0%B8%A1%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5+12150&output=embed&z=16"
              width="100%"
              height="280"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p>{t('footer.copyright')}</p>
            <p className="text-xs">{t('footer.disclaimer')}</p>
          </div>
          <a
            href="https://www.dbd.go.th"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img src="/dbd.jpg" alt="DBD Registered" className="h-12 w-auto object-contain rounded" />
          </a>
        </div>
      </div>
    </footer>
  );
}
