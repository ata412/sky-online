import { redirect } from 'next/navigation';

export default async function RegisterPage({ params }) {
  const { locale } = await params;
  redirect(locale === 'th' ? '/' : `/${locale}`);
}
