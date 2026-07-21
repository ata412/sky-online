'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, MapPin, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { getActivityPhotos } from '@/services/api';

const activityGradients = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-rose-500 to-rose-700',
];
const activityEmojis = ['🎯', '🌳', '📚', '🎉', '✈️'];

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Lightbox({ activity, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActivityPhotos(activity.id)
      .then((res) => {
        if (!cancelled) setPhotos(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activity.id]);

  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <X size={28} />
      </button>

      <h3 className="absolute top-5 left-5 right-16 text-white/90 text-sm sm:text-base font-medium truncate">
        {activity.title}
      </h3>

      {loading ? (
        <div className="text-white/60 text-sm">…</div>
      ) : photos.length === 0 ? (
        <div className="text-white/60 text-sm">No photos</div>
      ) : (
        <>
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            <button
              onClick={prev}
              className="absolute left-0 sm:-left-14 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>

            <img
              src={photos[index].image_url}
              alt={activity.title}
              className="max-h-[75vh] max-w-full object-contain rounded-lg"
            />

            <button
              onClick={next}
              className="absolute right-0 sm:-right-14 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <p className="text-white/60 text-xs mt-4">{index + 1} / {photos.length}</p>
        </>
      )}
    </div>
  );
}

export default function ActivityGrid({ activities }) {
  const t = useTranslations();
  const locale = useLocale();
  const [imgErrors, setImgErrors] = useState({});
  const [openActivity, setOpenActivity] = useState(null);

  if (activities.length === 0) {
    return <div className="text-center py-20 text-gray-400">{t('activities.noActivities')}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, idx) => {
          const hasImg = activity.image_url && !imgErrors[activity.id];
          return (
            <div key={activity.id} className="card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <button
                onClick={() => setOpenActivity(activity)}
                className={`group relative h-52 flex-shrink-0 w-full ${hasImg ? 'bg-gray-100 dark:bg-navy-800' : `bg-gradient-to-br ${activityGradients[idx % activityGradients.length]}`} flex items-center justify-center overflow-hidden`}
              >
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-medium">
                    <Images size={18} /> {t('activities.viewPhotos')}
                  </div>
                </div>
              </button>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-navy-900 dark:text-white text-lg mb-2 leading-snug">{activity.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-grow mb-4 font-light">{activity.description}</p>
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-navy-800">
                  {activity.activity_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={15} className="text-gold-500 flex-shrink-0" />
                      <span>{formatDate(activity.activity_date, locale)}</span>
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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

      {openActivity && <Lightbox activity={openActivity} onClose={() => setOpenActivity(null)} />}
    </>
  );
}
