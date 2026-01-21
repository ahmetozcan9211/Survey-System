import Link from 'next/link';
import SurveyEditor from '@/components/SurveyEditor';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditSurveyPage({ params }: PageProps) {
    const { id } = await params;

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

    // Normalize data for editor (ensure required field is present and not null)
    const surveyData: any = {
        ...survey,
        questions: survey.questions.map(q => ({
            ...q,
            required: (q as any).required ?? true // Default to true if null (migration case)
        }))
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &larr; Back to Dashboard
                </Link>
            </div>

            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Edit Survey</h1>
                <p style={{ color: 'var(--text-muted)' }}>Updating: {survey.titleTR || survey.titleEN}</p>
            </header>

            <SurveyEditor initialData={surveyData} surveyId={survey.id} />
        </div>
    );
}
