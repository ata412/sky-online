import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Play } from 'lucide-react';
import { getActivitiesServer, getContentTranslationsServer } from '@/services/api';
import ActivityGrid from '@/components/ActivityGrid';
import { getSeoAlternates } from '@/lib/seo';
import { localizeContent } from '@/lib/localizeContent';

import { ACTIVITY_VIDEOS } from '@/data/activityVideos';
import { LOCALIZED_KNOWLEDGE_AND_VIDEOS } from '@/data/localizedKnowledgeAndVideos';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('activitiesTitle'),
    description: t('activitiesDescription'),
    alternates: getSeoAlternates(locale, '/activities'),
  };
}

export default async function ActivitiesPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const videoTitles = new Map(
    LOCALIZED_KNOWLEDGE_AND_VIDEOS[locale]?.videos.map((video) => [video.id, video.title]) || []
  );
  const [activities, translations] = await Promise.all([
    getActivitiesServer(),
    locale === 'th' ? Promise.resolve([]) : getContentTranslationsServer('activities', locale),
  ]);
  const { activity } = (await searchParams) ?? {};

  return (
    <div>
      {/* Hero */}
      <div className="bg-hero-gradient py-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('activities.title')}</h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          {t('activities.subtitle')}
        </p>
      </div>

      {/* VIDEO Company Activities */}
      <section className="bg-navy-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Play size={18} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              VIDEO <span className="text-gold-400">{t('activities.videoSection')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ACTIVITY_VIDEOS.map((v) => (
              <div key={v.id} className="flex flex-col gap-3">
                <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={videoTitles.get(v.id) || v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed px-1">{videoTitles.get(v.id) || v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Activities */}
      <section className="bg-gray-50 dark:bg-navy-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              {t('activities.companyActivities')} <span className="text-gold-600 dark:text-gold-400">{t('activities.activitiesLabel')}</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('activities.photoActivities')}</p>
            <div className="mt-2 w-16 h-1 bg-gold-500 rounded-full" />
          </div>

          <ActivityGrid activities={localizeContent(activities ?? [], translations ?? [])} selectedActivityId={activity} />
        </div>
      </section>
    </div>
  );
}
