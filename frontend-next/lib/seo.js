import { routing } from '@/i18n/routing';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sky-online-six.vercel.app')
  .replace(/\/$/, '');

export function localizedPath(locale, pathname = '/') {
  const normalizedPath = pathname === '/' ? '' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${localePrefix}${normalizedPath}` || '/';
}

export function getSeoAlternates(locale, pathname = '/') {
  const languages = Object.fromEntries(
    routing.locales.map((supportedLocale) => [
      supportedLocale,
      localizedPath(supportedLocale, pathname),
    ])
  );
  languages['x-default'] = localizedPath(routing.defaultLocale, pathname);

  return {
    canonical: localizedPath(locale, pathname),
    languages,
  };
}
