import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Play } from 'lucide-react';
import { getActivitiesServer } from '@/services/api';
import ActivityGrid from '@/components/ActivityGrid';

const VIDEOS = [
  {
    id: 'lAUbve-8Bok',
    title: 'แนะนำ บริษัท บัวหลวงอินเตอร์ จำกัด และ บริษัท สกายออนไลน์กรุ๊ป จำกัด',
  },
  {
    id: 'YT5gpg_YYKQ',
    title: 'แนะนำบริษัท สกายออนไลน์กรุ๊ป จำกัด',
  },
  {
    id: '0vSxjbOA7Hk',
    title: 'แถลงข่าว "วันแห่งเกียรติยศ" พิธีประดับเข็มเกียรติยศให้กับนักธุรกิจ บริษัท สกายออนไลน์กรุ๊ป จำกัด ณ สโมสรตำรวจ กรุงเทพฯ เมื่อวันที่ 26 เมษายน 2568',
  },
];

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('activitiesTitle'),
    description: t('activitiesDescription'),
  };
}

export default async function ActivitiesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const activities = (await getActivitiesServer()) ?? [];

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
            {VIDEOS.map((v) => (
              <div key={v.id} className="flex flex-col gap-3">
                <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed px-1">{v.title}</p>
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

          <ActivityGrid activities={activities} />
        </div>
      </section>
    </div>
  );
}
