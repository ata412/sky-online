import { routing } from '@/i18n/routing';
import { getProductsServer } from '@/services/api';
import { SITE_URL, localizedPath } from '@/lib/seo';

export const revalidate = 3600;

const PUBLIC_ROUTES = [
  { pathname: '/', changeFrequency: 'weekly', priority: 1 },
  { pathname: '/products', changeFrequency: 'daily', priority: 0.9 },
  { pathname: '/encyclopedia', changeFrequency: 'weekly', priority: 0.8 },
  { pathname: '/promotions', changeFrequency: 'weekly', priority: 0.8 },
  { pathname: '/vision', changeFrequency: 'monthly', priority: 0.6 },
  { pathname: '/activities', changeFrequency: 'weekly', priority: 0.7 },
  { pathname: '/hall-of-fame', changeFrequency: 'weekly', priority: 0.7 },
  { pathname: '/contact', changeFrequency: 'monthly', priority: 0.5 },
];

function sitemapEntry(locale, route) {
  const languages = Object.fromEntries(
    routing.locales.map((supportedLocale) => [
      supportedLocale,
      `${SITE_URL}${localizedPath(supportedLocale, route.pathname)}`,
    ])
  );
  languages['x-default'] = `${SITE_URL}${localizedPath(routing.defaultLocale, route.pathname)}`;

  return {
    url: `${SITE_URL}${localizedPath(locale, route.pathname)}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages },
  };
}

export default async function sitemap() {
  let products = [];
  try {
    products = (await getProductsServer()) ?? [];
  } catch (error) {
    console.error('[sitemap] unable to load product URLs', error);
  }

  const productRoutes = products
    .filter((product) => product?.id !== undefined && product?.id !== null)
    .map((product) => ({
      pathname: `/products/${product.id}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return routing.locales.flatMap((locale) =>
    [...PUBLIC_ROUTES, ...productRoutes].map((route) => sitemapEntry(locale, route))
  );
}
