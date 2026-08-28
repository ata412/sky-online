'use client';

import { useEffect, useState } from 'react';

const HERO_SLIDES = [
  {
    desktop: '/hero-building-desktop.jpg',
    mobile: '/hero-building-mobile.jpg',
  },
  {
    desktop: '/hero-city-desktop.jpg',
    mobile: '/hero-city-mobile.jpg',
  },
];

const SLIDE_DURATION_MS = 6500;

export default function HeroBackgroundSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {HERO_SLIDES.map((slide, index) => (
        <picture
          key={slide.desktop}
          className={`absolute inset-0 block transition-opacity duration-1000 ease-in-out ${
            index === activeSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source media="(max-width: 767px)" srcSet={slide.mobile} />
          <img
            src={slide.desktop}
            alt=""
            fetchPriority={index === 0 ? 'high' : 'auto'}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover object-top md:object-top"
          />
        </picture>
      ))}
    </div>
  );
}
