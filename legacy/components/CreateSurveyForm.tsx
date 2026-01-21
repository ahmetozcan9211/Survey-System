'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSurveyForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('SATISFACTION');

    const [questions, setQuestions] = useState<any[]>([
        { id: Date.now(), type: 'RATE', textTR: '', textEN: '', descriptionTR: '', descriptionEN: '', options: [] }
    ]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now(), type: 'RATE', textTR: '', textEN: '', descriptionTR: '', descriptionEN: '', options: [] }
        ]);
    };

    const removeQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };

    const addOption = (qIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.push({ textTR: '', textEN: '' });
        setQuestions(newQ);
    };

    const updateOption = (qIndex: number, oIndex: number, field: string, value: string) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex][field] = value;
        setQuestions(newQ);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.splice(oIndex, 1);
        setQuestions(newQ);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/survey/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    type,
                    questions: questions.map((q, i) => ({
                        ...q,
                        order: i + 1
                    }))
                })
            });

            if (!res.ok) throw new Error('Failed');
            router.push('/admin');
            router.refresh();
        } catch (e) {
            alert('Error creating survey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '40px' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>Basic Info</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Survey Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Müşteri Memnuniyet Anketi 2026"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Survey Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        >
                            <option value="SATISFACTION">Customer Satisfaction</option>
                            <option value="SURVEILLANCE">Post-Sales Surveillance</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Questions</h2>
                    <button
                        type="button"
                        onClick={addQuestion}
                        style={{
                            backgroundColor: 'var(--secondary)',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        + Add Question
                    </button>
                </div>

                {questions.map((q, idx) => (
                    <div key={q.id} style={{
                        backgroundColor: 'var(--surface)',
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                            <button
                                type="button"
                                onClick={() => removeQuestion(idx)}
                                style={{
                                    color: 'var(--error)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            >
                                Remove
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px', display: 'block' }}>Question {idx + 1}</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
                                <div style={{ width: '200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type</label>
                                    <select
                                        value={q.type}
                                        onChange={e => updateQuestion(idx, 'type', e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="RATE">Rating (1-5)</option>
                                        <option value="CHOICE">Multiple Choice</option>
                                        <option value="TEXT">Text Answer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Question Text (TR)</label>
                                <input
                                    required
                                    type="text"
                                    value={q.textTR}
                                    onChange={e => updateQuestion(idx, 'textTR', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Question Text (EN)</label>
                                <input
                                    required
                                    type="text"
                                    value={q.textEN}
                                    onChange={e => updateQuestion(idx, 'textEN', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Description (TR) (Optional)</label>
                                <input
                                    type="text"
                                    value={q.descriptionTR}
                                    onChange={e => updateQuestion(idx, 'descriptionTR', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Description (EN) (Optional)</label>
                                <input
                                    type="text"
                                    value={q.descriptionEN}
                                    onChange={e => updateQuestion(idx, 'descriptionEN', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>

                        {q.type === 'CHOICE' && (
                            <div style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: 'var(--radius)' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 500 }}>Options</label>
                                <div style={{ display: 'grid', gap: '10px', marginBottom: '10px' }}>
                                    {q.options.map((opt: any, oIdx: number) => (
                                        <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                placeholder="TR Option"
                                                required
                                                value={opt.textTR}
                                                onChange={e => updateOption(idx, oIdx, 'textTR', e.target.value)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                            />
                                            <input
                                                placeholder="EN Option"
                                                required
                                                value={opt.textEN}
                                                onChange={e => updateOption(idx, oIdx, 'textEN', e.target.value)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(idx, oIdx)}
                                                style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addOption(idx)}
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary)',
                                        background: 'none',
                                        border: '1px dashed var(--primary)',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add Option
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '16px 40px',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    {loading ? 'Creating...' : 'Create Survey'}
                </button>
            </div>
        </form>
    );
}
