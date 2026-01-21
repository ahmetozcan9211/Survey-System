'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function SurveyActions({ id }: { id: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this survey and all its responses?')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/survey/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            router.refresh();
        } catch (e) {
            alert('Error deleting survey');
        } finally {
            setDeleting(false);
        }
    };

    const btnStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginLeft: '10px',
        textDecoration: 'underline'
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Link
                href={`/admin/survey/${id}/edit`}
                style={{ color: 'var(--primary)', fontWeight: 500, marginLeft: '16px' }}
            >
                Edit
            </Link>
            <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                    ...btnStyle,
                    color: 'var(--error)',
                    opacity: deleting ? 0.5 : 1
                }}
            >
                {deleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
