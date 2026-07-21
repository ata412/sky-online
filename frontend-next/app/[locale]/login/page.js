import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LoginForm from '@/components/LoginForm';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('loginTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
