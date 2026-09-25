import { Link } from '@/i18n/routing';

export default function HomeActivityCarousel({ activities }) {
  const visibleActivities = activities.filter((activity) => activity.image_url);
  if (visibleActivities.length === 0) return null;

  const renderCards = (duplicate = false) =>
    visibleActivities.map((activity) => (
      <Link
        key={`${activity.id}-${duplicate ? 'copy' : 'original'}`}
        href={`/activities?activity=${activity.id}`}
        tabIndex={duplicate ? -1 : undefined}
        className="group w-[78vw] max-w-[360px] sm:w-[340px] shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 dark:border-navy-700 dark:bg-navy-800"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-navy-700">
          <img
            src={activity.image_url}
            alt={activity.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-relaxed text-navy-900 dark:text-white">
            {activity.title}
          </h3>
        </div>
      </Link>
    ));

  return (
    <div className="activity-carousel overflow-hidden" aria-label="Company Activities">
      <div
        className={`activity-carousel-track flex w-max ${visibleActivities.length > 1 ? 'activity-carousel-moving' : ''}`}
        style={{ animationDuration: `${Math.max(visibleActivities.length * 9, 36)}s` }}
      >
        <div className="flex shrink-0 gap-5 pr-5">{renderCards()}</div>
        {visibleActivities.length > 1 && (
          <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">{renderCards(true)}</div>
        )}
      </div>
    </div>
  );
}
