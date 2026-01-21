import prisma from '@/lib/prisma';
import HomePageClient from '@/components/HomePageClient';

export default async function Home() {
  const surveys = await prisma.survey.findMany();

  // Sort surveys by creation date (newest first)
  const sortedSurveys = surveys.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <HomePageClient surveys={sortedSurveys} />;
}
