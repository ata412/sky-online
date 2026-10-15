import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSeoAlternates } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('visionTitle'),
    description: t('visionDescription'),
    alternates: getSeoAlternates(locale, '/vision'),
  };
}

export default async function VisionPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-gray-50 dark:bg-navy-950 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <img
          src="/vision-1.jpg"
          alt="Sky Online Vision 1"
          width={1920}
          height={1080}
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
        <img
          src="/vision-2.jpg"
          alt="Sky Online Vision 2"
          width={1920}
          height={1080}
          loading="lazy"
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
