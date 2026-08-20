import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import VideoStudioClient from '@/components/VideoStudioClient';
import { VIDEO_STUDIO_ENABLED } from '@/lib/features';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('videoStudioTitle'),
    description: t('videoStudioDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ImageStudioPage({ params }) {
  if (!VIDEO_STUDIO_ENABLED) notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  return <VideoStudioClient />;
}
