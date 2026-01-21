import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ lang?: string }>;
}

export default async function SurveyPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const lang = (await searchParams).lang === 'en' ? 'en' : 'tr';

    const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
            questions: {
                include: { options: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!survey) return notFound();

    // Pick title based on lang
    const surveyTitle = lang === 'en' ? (survey as any).titleEN : (survey as any).titleTR;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
            <SurveyForm survey={survey} lang={lang} title={surveyTitle} />
        </div>
    );
}
