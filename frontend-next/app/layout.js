import { SITE_URL } from '@/lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }) {
  return children;
}
