import { useEffect, useState } from 'react';
import { Crown, Star, Trophy, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHallOfFame } from '../services/api';
import { lazy, Suspense } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const HofCanvas = lazy(() => import('../components/three/HofCanvas'));

const LEVELS = [
  'Sky Star',
  'Super Star',
  'Manager Director',
  'Vice President',
  'President Black',
  'Diamond Blue',
  'Diamond Crown',
  'Diamond',
];

const levelConfig = {
  Diamond: {
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    badge: 'bg-amber-500',
    text: 'text-amber-900',
    icon: <Trophy size={20} className="text-amber-900" />,
    ring: 'ring-4 ring-amber-400',
    label: 'Diamond',
    labelTh: 'ไดมอนด์',
    glow: 'shadow-amber-300',
  },
  'Diamond Crown': {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-500',
    badge: 'bg-slate-400',
    text: 'text-slate-900',
    icon: <Crown size={20} className="text-slate-900" />,
    ring: 'ring-4 ring-slate-300',
    label: 'Diamond Crown',
    labelTh: 'ไดมอนด์ คราวน์',
    glow: 'shadow-slate-300',
  },
  'Diamond Blue': {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-800',
    badge: 'bg-blue-600',
    text: 'text-white',
    icon: <Crown size={20} className="text-blue-200" />,
    ring: 'ring-4 ring-blue-400',
    label: 'Diamond Blue',
    labelTh: 'ไดมอนด์ บลู',
    glow: 'shadow-blue-300',
  },
  'President Black': {
    bg: 'bg-gradient-to-br from-gray-800 to-black',
    badge: 'bg-gray-700',
    text: 'text-white',
    icon: <Star size={20} className="text-gold-400 fill-gold-400" />,
    ring: 'ring-4 ring-gray-600',
    label: 'President Black',
    labelTh: 'ประธาน แบล็ค',
    glow: 'shadow-gray-500',
  },
  'Vice President': {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-800',
    badge: 'bg-purple-600',
    text: 'text-white',
    icon: <Star size={20} className="text-purple-200 fill-purple-200" />,
    ring: 'ring-4 ring-purple-400',
    label: 'Vice President',
    labelTh: 'รองประธาน',
    glow: 'shadow-purple-300',
  },
  'Manager Director': {
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-800',
    badge: 'bg-indigo-600',
    text: 'text-white',
    icon: <Star size={20} className="text-indigo-200 fill-indigo-200" />,
    ring: 'ring-4 ring-indigo-400',
    label: 'Manager Director',
    labelTh: 'ผู้จัดการ',
    glow: 'shadow-indigo-300',
  },
  'Super Star': {
    bg: 'bg-gradient-to-br from-sky-400 to-sky-700',
    badge: 'bg-sky-500',
    text: 'text-white',
    icon: <Star size={20} className="text-sky-100 fill-sky-100" />,
    ring: 'ring-4 ring-sky-400',
    label: 'Super Star',
    labelTh: 'ซุปเปอร์สตาร์',
    glow: 'shadow-sky-300',
  },
  'Sky Star': {
    bg: 'bg-gradient-to-br from-cyan-300 to-cyan-600',
    badge: 'bg-cyan-400',
    text: 'text-white',
    icon: <Star size={20} className="text-cyan-100 fill-cyan-100" />,
    ring: 'ring-4 ring-cyan-300',
    label: 'Sky Star',
    labelTh: 'สกาย สตาร์',
    glow: 'shadow-cyan-300',
  },
};

function getInitials(name) {
  return name.replace('คุณ', '').trim().charAt(0) || '?';
}

function MemberCard({ member, cfg, level }) {
  return (
    <div className="card p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className={`w-20 h-20 rounded-full ${cfg.bg} ${cfg.ring} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <span className={`text-2xl font-bold ${cfg.text}`}>{getInitials(member.name)}</span>
      </div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.bg} mb-3`}>
        {cfg.icon}
        <span className={`text-xs font-semibold ${cfg.text}`}>{level}</span>
      </div>
      <h3 className="font-bold text-navy-900 text-base mb-1">{member.name}</h3>
      {member.achievement && <p className="text-xs text-gold-600 font-medium mb-2">{member.achievement}</p>}
      {member.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{member.description}</p>}
      {(member.month || member.year) && (
        <p className="text-xs text-gray-400 mt-3">{member.month} {member.year}</p>
      )}
    </div>
  );
}

export default function HallOfFame() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [years, setYears] = useState([]);
  const [months] = useState([
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]);

  const fetchData = (year, month) => {
    setLoading(true);
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    getHallOfFame(params)
      .then((r) => {
        setMembers(r.data);
        const uniqueYears = [...new Set(r.data.map((m) => m.year).filter(Boolean))].sort((a, b) => b - a);
        setYears(uniqueYears);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData('', ''); }, []);

  const handleFilter = () => fetchData(filterYear, filterMonth);
  const handleClear = () => {
    setFilterYear('');
    setFilterMonth('');
    fetchData('', '');
  };

  const groupedByLevel = LEVELS.slice().reverse().reduce((acc, level) => {
    const group = members.filter((m) => m.level === level);
    if (group.length > 0) acc[level] = group;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <div className="bg-hero-gradient py-20 text-center px-4 relative overflow-hidden">
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <HofCanvas />
          </Suspense>
        </ErrorBoundary>
        <div className="relative z-10">
          <Trophy size={56} className="text-gold-400 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('hallOfFame.title')}</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            {t('hallOfFame.subtitle')}
          </p>
        </div>
      </div>

      {/* Rank Legend */}
      <div className="bg-white border-b border-gray-100 py-6 overflow-x-auto">
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
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-10 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('hallOfFame.yearLabel')}</label>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white min-w-[120px]"
              >
                <option value="">{t('hallOfFame.allYears')}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('hallOfFame.monthLabel')}</label>
            <div className="relative">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white min-w-[160px]"
              >
                <option value="">{t('hallOfFame.allMonths')}</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleFilter} className="btn-gold py-2.5">{t('hallOfFame.filter')}</button>
            <button onClick={handleClear} className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">{t('hallOfFame.clear')}</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t('hallOfFame.noData')}</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedByLevel).map(([level, group]) => {
              const cfg = levelConfig[level] || levelConfig['Sky Star'];
              return (
                <div key={level}>
                  <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${cfg.bg} mb-6 shadow-lg shadow-${cfg.glow}`}>
                    {cfg.icon}
                    <h2 className={`text-lg font-bold ${cfg.text}`}>{level}</h2>
                    <span className={`text-sm ${cfg.text} opacity-75`}>({cfg.labelTh})</span>
                    <span className={`ml-1 text-sm font-medium ${cfg.text} opacity-75`}>· {t('hallOfFame.persons', { count: group.length })}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {group.map((member) => (
                      <MemberCard key={member.id} member={member} cfg={cfg} level={level} />
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
