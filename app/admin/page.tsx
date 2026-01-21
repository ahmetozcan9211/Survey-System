import Link from 'next/link';
import prisma from '@/lib/prisma';
import SurveyActions from '@/components/SurveyActions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const surveys = await prisma.survey.findMany({
        include: {
            _count: {
                select: { responses: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your surveys</p>
                </div>
                <Link
                    href="/admin/create"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    + Create New Survey
                </Link>
            </header>

            <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: 600 }}>Title</th>
                            <th style={{ padding: '16px', fontWeight: 600 }}>Type</th>
                            <th style={{ padding: '16px', fontWeight: 600 }}>Responses</th>
                            <th style={{ padding: '16px', fontWeight: 600 }}>Created At</th>
                            <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveys.map(survey => (
                            <tr key={survey.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px' }}>{(survey as any).titleTR} <small style={{ color: 'gray' }}>({(survey as any).titleEN})</small></td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '16px',
                                        fontSize: '0.8rem',
                                        backgroundColor: survey.type === 'SATISFACTION' ? '#E0F2FE' : '#FCE7F3',
                                        color: survey.type === 'SATISFACTION' ? '#0369A1' : '#BE185D'
                                    }}>
                                        {survey.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{survey._count.responses}</td>
                                <td style={{ padding: '16px' }}>{survey.createdAt.toLocaleDateString()}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <Link
                                        href={`/admin/survey/${survey.id}/responses`}
                                        style={{
                                            color: 'var(--primary)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        View Responses
                                    </Link>
                                    <SurveyActions id={survey.id} />
                                </td>
                            </tr>
                        ))}
                        {surveys.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No surveys found. Create one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
