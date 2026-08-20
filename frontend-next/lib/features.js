export const COMMERCE_ENABLED = process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'true';

export const VIDEO_STUDIO_ENABLED =
  (process.env.NEXT_PUBLIC_IMAGE_STUDIO_ENABLED
    ?? process.env.NEXT_PUBLIC_VIDEO_STUDIO_ENABLED) !== 'false';
