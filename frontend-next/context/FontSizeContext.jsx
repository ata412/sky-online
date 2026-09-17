'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const FontSizeContext = createContext(null);
const STORAGE_KEY = 'sky_font_size';
const LEVELS = [1, 2, 3];

function isValidLevel(value) {
  return LEVELS.includes(Number(value));
}

export function FontSizeProvider({ children }) {
  const [fontSizeLevel, setFontSizeLevelState] = useState(1);

  useEffect(() => {
    let initial = 1;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isValidLevel(saved)) initial = Number(saved);
    } catch {
      // Keep level 1 when storage is unavailable.
    }
    setFontSizeLevelState(initial);
    document.documentElement.dataset.fontSize = String(initial);
  }, []);

  const setFontSizeLevel = (level) => {
    if (!isValidLevel(level)) return;
    const next = Number(level);
    setFontSizeLevelState(next);
    document.documentElement.dataset.fontSize = String(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // The selected level still applies for this session.
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSizeLevel, setFontSizeLevel }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);
