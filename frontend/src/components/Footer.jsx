import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { to: '/', label: t('footer.quickLinkItems.home') },
    { to: '/products', label: t('footer.quickLinkItems.products') },
    { to: '/promotions', label: t('footer.quickLinkItems.promotions') },
    { to: '/vision', label: t('footer.quickLinkItems.vision') },
    { to: '/activities', label: t('footer.quickLinkItems.activities') },
    { to: '/hall-of-fame', label: t('footer.quickLinkItems.hallOfFame') },
    { to: '/contact', label: t('footer.quickLinkItems.contact') },
  ];

  return (
    <footer className="bg-navy-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-gray-400 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold-400 font-semibold mb-4 text-base">{t('footer.contactUs')}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <span>28/14 ถ.ลำลูกกา ต.บึงคำพร้อย อ.ลำลูกกา ปทุมธานี 12150</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-500 flex-shrink-0" />
                <a href="tel:026901234" className="hover:text-gold-400 transition-colors">02-690-1234</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-500 flex-shrink-0" />
                <a href="mailto:info@skyonline.co.th" className="hover:text-gold-400 transition-colors">
                  info@skyonline.co.th
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-navy-800 rounded-lg">
              <p className="text-xs text-gray-500">{t('footer.businessHours')}</p>
              <p className="text-sm text-gray-300 font-medium">{t('footer.monFri')}</p>
              <p className="text-sm text-gray-300 font-medium">{t('footer.sat')}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-navy-700">
          <h4 className="text-gold-400 font-semibold mb-3 text-sm flex items-center gap-2">
            <MapPin size={15} /> {t('footer.findUs')}
          </h4>
          <div className="rounded-xl overflow-hidden border border-navy-700">
            <iframe
              title="Sky Online Location"
              src="https://maps.google.com/maps?q=28+14+%E0%B8%96.%E0%B8%A5%E0%B8%B3%E0%B8%A5%E0%B8%B9%E0%B8%81%E0%B8%81%E0%B8%B2+%E0%B8%95.%E0%B8%9A%E0%B8%B6%E0%B8%87%E0%B8%84%E0%B8%B3%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A2+%E0%B8%AD.%E0%B8%A5%E0%B8%B3%E0%B8%A5%E0%B8%B9%E0%B8%81%E0%B8%81%E0%B8%B2+%E0%B8%9B%E0%B8%97%E0%B8%B8%E0%B8%A1%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5+12150&output=embed&z=16"
              width="100%"
              height="280"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              tabIndex="-1"
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
