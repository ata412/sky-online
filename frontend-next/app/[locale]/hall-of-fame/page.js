import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Crown, Star, Trophy } from 'lucide-react';
import { getHallOfFameServer } from '@/services/api';
import HofCanvasWrapper from '@/components/HofCanvasWrapper';

const LEVELS = [
  'Sky Star',
  'Super Star',
  'Manager',
  'Director',
  'Vice President',
  'President',
  'Diamond',
  'Red Diamond',
  'Black Diamond',
  'Blue Diamond',
  'Crown Diamond',
];

const levelConfig = {
  'Crown Diamond': {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-500',
    text: 'text-slate-900',
    icon: <Crown size={20} className="text-slate-900" />,
    labelTh: 'ไดมอนด์ คราวน์',
  },
  'Blue Diamond': {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-800',
    text: 'text-white',
    icon: <Crown size={20} className="text-blue-200" />,
    labelTh: 'ไดมอนด์ บลู',
  },
  'Black Diamond': {
    bg: 'bg-gradient-to-br from-gray-800 to-black',
    text: 'text-white',
    icon: <Crown size={20} className="text-gray-300" />,
    labelTh: 'ไดมอนด์ แบล็ค',
  },
  'Red Diamond': {
    bg: 'bg-gradient-to-br from-red-600 to-red-900',
    text: 'text-white',
    icon: <Crown size={20} className="text-red-200" />,
    labelTh: 'ไดมอนด์ เรด',
  },
  Diamond: {
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    text: 'text-amber-900',
    icon: <Trophy size={20} className="text-amber-900" />,
    labelTh: 'ไดมอนด์',
  },
  President: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    text: 'text-white',
    icon: <Star size={20} className="text-gold-400 fill-gold-400" />,
    labelTh: 'ประธาน',
  },
  'Vice President': {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-800',
    text: 'text-white',
    icon: <Star size={20} className="text-purple-200 fill-purple-200" />,
    labelTh: 'รองประธาน',
  },
  Director: {
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-800',
    text: 'text-white',
    icon: <Star size={20} className="text-indigo-200 fill-indigo-200" />,
    labelTh: 'ผู้อำนวยการ',
  },
  Manager: {
    bg: 'bg-gradient-to-br from-teal-500 to-teal-800',
    text: 'text-white',
    icon: <Star size={20} className="text-teal-200 fill-teal-200" />,
    labelTh: 'ผู้จัดการ',
  },
  'Super Star': {
    bg: 'bg-gradient-to-br from-sky-400 to-sky-700',
    text: 'text-white',
    icon: <Star size={20} className="text-sky-100 fill-sky-100" />,
    labelTh: 'ซุปเปอร์สตาร์',
  },
  'Sky Star': {
    bg: 'bg-gradient-to-br from-cyan-300 to-cyan-600',
    text: 'text-white',
    icon: <Star size={20} className="text-cyan-100 fill-cyan-100" />,
    labelTh: 'สกาย สตาร์',
  },
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('hallOfFameTitle'),
    description: t('hallOfFameDescription'),
  };
}

export default async function HallOfFamePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const members = (await getHallOfFameServer()) ?? [];

  const groupedByLevel = LEVELS.slice().reverse().reduce((acc, level) => {
    const group = members.filter((m) => m.level === level);
    if (group.length > 0) acc[level] = group;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <div className="bg-hero-gradient py-20 text-center px-4 relative overflow-hidden">
        <HofCanvasWrapper />
        <div className="relative z-10">
          <Trophy size={56} className="text-gold-400 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('hallOfFame.title')}</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            {t('hallOfFame.subtitle')}
          </p>
        </div>
      </div>

      {/* Rank Legend */}
      <div className="bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-800 py-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 min-w-max mx-auto justify-center flex-wrap">
            {LEVELS.slice().reverse().map((level) => {
              const cfg = levelConfig[level];
              return (
                <div key={level} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg} shadow-sm`}>
                  {cfg.icon}
                  <span className={`text-xs font-semibold ${cfg.text}`}>{level}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {members.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t('hallOfFame.noData')}</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedByLevel).map(([level, group]) => {
              const cfg = levelConfig[level] || levelConfig['Sky Star'];
              return (
                <div key={level}>
                  <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${cfg.bg} mb-6 shadow-lg`}>
                    {cfg.icon}
                    <h2 className={`text-lg font-bold ${cfg.text}`}>{level}</h2>
                    <span className={`text-sm ${cfg.text} opacity-75`}>({cfg.labelTh})</span>
                    <span className={`ml-1 text-sm font-medium ${cfg.text} opacity-75`}>· {t('hallOfFame.persons', { count: group.length })}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {group.map((member) => (
                      <div
                        key={member.id}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-navy-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        <img
                          src={member.image_url}
                          alt={level}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
