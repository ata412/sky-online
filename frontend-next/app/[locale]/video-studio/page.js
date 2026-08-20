import { redirect } from 'next/navigation';

export default async function LegacyVideoStudioPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/image-studio`);
}
