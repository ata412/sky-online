import { getTranslations, setRequestLocale } from 'next-intl/server';
import RegisterForm from '@/components/RegisterForm';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('registerTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div>
      <div className="bg-hero-gradient py-16 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{t('register.title')}</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          {t('register.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <RegisterForm />
      </div>
    </div>
  );
}
