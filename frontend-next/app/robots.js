import { routing } from '@/i18n/routing';
import { SITE_URL, localizedPath } from '@/lib/seo';

const PRIVATE_PATHS = ['/checkout', '/login', '/register', '/chatbot', '/video-studio'];

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: routing.locales.flatMap((locale) =>
        PRIVATE_PATHS.map((pathname) => localizedPath(locale, pathname))
      ),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
