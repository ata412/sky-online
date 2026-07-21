import { getTranslations, setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/ContactForm';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
  };
}

export default async function ContactPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div>
      <div className="bg-hero-gradient py-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('contact.title')}</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ContactForm />
      </div>
    </div>
  );
}
