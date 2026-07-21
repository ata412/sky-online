'use client';

import { useState } from 'react';

export default function SplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8 p-4">
      <img
        src="/splash-image.webp"
        alt=""
        className="max-w-full max-h-[70vh] object-contain"
      />
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="เข้าสู่เว็บไซต์"
      >
        <img
          src="/splash-enter-button.png"
          alt="เข้าสู่เว็บไซต์"
          className="h-24 w-auto hover:scale-105 transition-transform"
        />
      </button>
    </div>
  );
}
