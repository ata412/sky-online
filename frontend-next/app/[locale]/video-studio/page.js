import { getTranslations, setRequestLocale } from 'next-intl/server';
import VideoStudioClient from '@/components/VideoStudioClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('videoStudioTitle'),
    description: t('videoStudioDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function VideoStudioPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VideoStudioClient />;
}
