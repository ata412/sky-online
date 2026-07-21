import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('visionTitle'),
    description: t('visionDescription'),
  };
}

export default async function VisionPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-gray-50 dark:bg-navy-950 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <img
          src="/vision.jpg"
          alt="Sky Online Vision"
          className="w-full rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
