'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Award, Truck, Ticket } from 'lucide-react';

export default function FeaturesSection() {
  const t = useTranslations();
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const features = [
    { icon: Award, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Truck, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Ticket, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
  ];

  const observe = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return observer;
  }, []);

  useEffect(() => {
    const observer = observe();
    return () => observer.disconnect();
  }, [observe]);

  return (
    <section className="bg-white dark:bg-navy-900 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={sectionRef}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`animate-fade-up ${i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''} group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 dark:border-navy-800 hover:border-gold-300 dark:hover:border-gold-600 hover:shadow-xl transition-all duration-300 cursor-default`}
            >
              <div className="w-20 h-20 bg-gold-50 dark:bg-navy-800 group-hover:bg-gold-100 dark:group-hover:bg-navy-700 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                <Icon size={36} className="text-gold-600 dark:text-gold-400" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-3">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
