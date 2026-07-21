'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Star } from 'lucide-react';

function useTypewriter(lines, speed = 70) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState(lines.map(() => ''));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (lineIndex >= lines.length) return;
    const current = lines[lineIndex];
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIndex] = current.slice(0, charIndex + 1);
          return next;
        });
        setCharIndex(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const pause = setTimeout(() => {
        setLineIndex(l => l + 1);
        setCharIndex(0);
      }, 300);
      return () => clearTimeout(pause);
    }
  }, [started, lineIndex, charIndex, lines, speed]);

  const activeLine = lineIndex < lines.length ? lineIndex : lines.length - 1;
  const done = lineIndex >= lines.length;
  return { displayed, activeLine, done };
}

export default function HeroContent() {
  const t = useTranslations();
  const heroLines = useMemo(() => [t('home.heroTitle1'), t('home.heroTitle2')], [t]);
  const { displayed, activeLine, done } = useTypewriter(heroLines, 70);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-2xl">
        <img
          src="/sky_online_logo.png"
          alt="Sky Online"
          className="h-12 sm:h-16 w-auto object-contain mb-6"
        />
        <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-600/40 rounded-full px-4 py-1.5 mb-6">
          <Star size={14} className="text-gold-400" />
          <span className="text-gold-400 text-sm font-medium">{t('home.badge')}</span>
        </div>
        <h1 className={`text-5xl sm:text-6xl font-bold text-white mb-6${done ? ' hero-bounce' : ''}`}>
          <span className="block">
            {displayed[0]}
            {activeLine === 0 && !done && <span className="typewriter-cursor text-white" />}
          </span>
          <span className="block mt-6 text-gold-400">
            {displayed[1]}
            {activeLine === 1 && !done && <span className="typewriter-cursor text-gold-400" />}
          </span>
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed mb-10">
          {t('home.heroDesc')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/products" className="btn-gold flex items-center gap-2">
            {t('home.viewAllProducts')} <ArrowRight size={18} />
          </Link>
          <Link href="/contact" className="btn-outline-gold">
            {t('home.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
