import Link from 'next/link';
import prisma from '@/lib/prisma';
import ResponseTable from '@/components/ResponseTable';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SurveyResponsesPage({ params }: PageProps) {
    const { id } = await params;

    const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { order: 'asc' }
            },
            responses: {
                include: { answers: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!survey) return notFound();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &larr; Back to Dashboard
                </Link>
            </div>

            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Survey Responses</h1>
                <p style={{ color: 'var(--text-muted)' }}>{(survey as any).titleTR} / {(survey as any).titleEN}</p>
            </header>

            <ResponseTable
                initialResponses={survey.responses}
                questions={survey.questions}
                surveyTitle={{ tr: (survey as any).titleTR, en: (survey as any).titleEN }}
            />
        </div>
    );
}
