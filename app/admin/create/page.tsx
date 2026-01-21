import Link from 'next/link';
import SurveyEditor from '@/components/SurveyEditor';

export default function CreateSurveyPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &larr; Back to Dashboard
                </Link>
            </div>

            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Create New Survey</h1>
                <p style={{ color: 'var(--text-muted)' }}>Design your survey questions</p>
            </header>

            <SurveyEditor />
        </div>
    );
}
