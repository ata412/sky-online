import { getTranslations, setRequestLocale } from 'next-intl/server';
import ChatbotClient from '@/components/ChatbotClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('chatbotTitle'),
    description: t('chatbotDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ChatbotPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ChatbotClient />;
}
