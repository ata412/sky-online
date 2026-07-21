'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

const HofCanvas = dynamic(() => import('@/components/three/HofCanvas'), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function HofCanvasWrapper() {
  const [webglSupported, setWebglSupported] = useState(false);

  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  if (!webglSupported) return null;

  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <HofCanvas />
      </Suspense>
    </ErrorBoundary>
  );
}
