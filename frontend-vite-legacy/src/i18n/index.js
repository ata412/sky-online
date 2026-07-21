import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import th from './th';
import en from './en';

const savedLang = localStorage.getItem('lang') || 'th';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      th,
      en,
    },
    lng: savedLang,
    fallbackLng: 'th',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
