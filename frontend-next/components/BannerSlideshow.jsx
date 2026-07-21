'use client';

import { useState, useEffect } from 'react';

const BANNERS = [
  '/brands/brand-luck/banner.jpg',
  '/brands/dietary-supplement/banner.jpg',
  '/brands/SD%20brand/banner.jpg',
];

export default function BannerSlideshow() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % BANNERS.length);
        setFading(false);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-navy-900" style={{ aspectRatio: '16/4' }}>
      {BANNERS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`banner-${i}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: current === i ? (fading ? 0 : 1) : 0 }}
        />
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold-500 w-5' : 'bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
