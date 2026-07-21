import { useEffect, useState } from 'react';
import { Calendar, MapPin, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getActivities } from '../services/api';

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

const activityGradients = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-rose-500 to-rose-700',
];
const activityEmojis = ['🎯', '🌳', '📚', '🎉', '✈️'];

export default function Activities() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    getActivities()
      .then((r) => setActivities(r.data))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

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
          {/* Section header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Play size={18} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              VIDEO <span className="text-gold-400">{t('activities.videoSection')}</span>
            </h2>
          </div>

          {/* Video grid */}
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
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">
              {t('activities.companyActivities')} <span className="text-gold-600">{t('activities.activitiesLabel')}</span>
            </h2>
            <p className="text-gray-500 mt-1">{t('activities.photoActivities')}</p>
            <div className="mt-2 w-16 h-1 bg-gold-500 rounded-full" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 text-gray-400">{t('activities.noActivities')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, idx) => {
                const hasImg = activity.image_url && !imgErrors[activity.id];
                return (
                  <div key={activity.id} className="card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    {/* Image / placeholder */}
                    <div className={`h-52 flex-shrink-0 ${hasImg ? 'bg-gray-100' : `bg-gradient-to-br ${activityGradients[idx % activityGradients.length]}`} flex items-center justify-center overflow-hidden`}>
                      {hasImg ? (
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                          onError={() => setImgErrors((prev) => ({ ...prev, [activity.id]: true }))}
                        />
                      ) : (
                        <span className="text-7xl">{activityEmojis[idx % activityEmojis.length]}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-navy-900 text-lg mb-2 leading-snug">{activity.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed flex-grow mb-4 font-light">{activity.description}</p>
                      <div className="space-y-2 pt-4 border-t border-gray-100">
                        {activity.activity_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={15} className="text-gold-500 flex-shrink-0" />
                            <span>{formatDate(activity.activity_date)}</span>
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={15} className="text-gold-500 flex-shrink-0" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
