export const COMMERCE_ENABLED = process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'true';

// Temporarily paused. Set this to false when Video Studio is ready to reopen.
const VIDEO_STUDIO_PAUSED = true;
export const VIDEO_STUDIO_ENABLED =
  !VIDEO_STUDIO_PAUSED && process.env.NEXT_PUBLIC_VIDEO_STUDIO_ENABLED === 'true';
