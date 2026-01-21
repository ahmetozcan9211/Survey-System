'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyData {
    titleTR: string;
    titleEN: string;
    type: string;
    questions: any[];
}

export default function SurveyEditor({ initialData, surveyId }: { initialData?: SurveyData, surveyId?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [titleTR, setTitleTR] = useState(initialData?.titleTR || '');
    const [titleEN, setTitleEN] = useState(initialData?.titleEN || '');
    const [type, setType] = useState(initialData?.type || 'SATISFACTION');

    const [questions, setQuestions] = useState<any[]>(initialData ? initialData.questions.map(q => ({
        ...q,
        // Ensure options is an array
        options: q.options || [],
        required: q.required !== undefined ? q.required : true // Default true
    })) : [
        { id: Date.now(), type: 'RATE', textTR: '', textEN: '', descriptionTR: '', descriptionEN: '', required: true, options: [] }
    ]);

    const addQuestion = () => {
        // We use negative random IDs for new questions locally if we needed to track them, 
        // but Date.now() is fine as long as we don't send it as a DB ID if it's not a real ID.
        // However, when editing, existing questions have string IDs (cuid).
        // We should handle "isNew" logic or just let the API handle "create if id missing".
        setQuestions([
            ...questions,
            { id: 'new-' + Date.now(), type: 'RATE', textTR: '', textEN: '', descriptionTR: '', descriptionEN: '', required: true, options: [] }
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
        newQ[qIndex].options.push({ id: 'new-' + Date.now(), textTR: '', textEN: '' });
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

    // Auto Translate Helper
    const [translating, setTranslating] = useState<string | null>(null); // "qIndex-field" or "qIndex-oIndex-field"

    const handleAutoTranslate = async (text: string, qIndex: number, field: string, oIndex: number = -1) => {
        // Only translate if there is text and the target field is empty (to avoid overwriting manual edits)
        // Determine target value to check
        let targetValue = '';
        if (oIndex === -1) {
            targetValue = questions[qIndex][field] || '';
        } else {
            targetValue = questions[qIndex].options[oIndex][field] || '';
        }

        if (!text || targetValue.trim() !== '') return;

        const indicatorId = oIndex === -1 ? `${qIndex}-${field}` : `${qIndex}-${oIndex}-${field}`;
        setTranslating(indicatorId);

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.translatedText) {
                if (oIndex === -1) {
                    updateQuestion(qIndex, field, data.translatedText);
                } else {
                    updateOption(qIndex, oIndex, field, data.translatedText);
                }
            }
        } catch (e) {
            console.error('Translation failed', e);
        } finally {
            setTranslating(null);
        }
    };

    const handleTitleTranslate = async (text: string) => {
        if (!text || titleEN.trim() !== '') return;
        setTranslating('titleEN');

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.translatedText) {
                setTitleEN(data.translatedText);
            }
        } catch (e) {
            console.error('Title translation failed', e);
        } finally {
            setTranslating(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = surveyId ? `/api/survey/${surveyId}` : '/api/survey/create';
            const method = surveyId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titleTR,
                    titleEN,
                    type,
                    questions: questions.map((q, i) => ({
                        ...q,
                        // Ensure required is sent
                        required: !!q.required,
                        order: i + 1,
                        // Prepare options stripping temp IDs if needed, but API usually ignores unknown fields or we handle it.
                        // For PUT, we need real IDs to update, and no IDs to create.
                        id: q.id.toString().startsWith('new-') ? undefined : q.id,
                        options: q.options.map((opt: any) => ({
                            ...opt,
                            id: opt.id && opt.id.toString().startsWith('new-') ? undefined : opt.id
                        }))
                    }))
                })
            });

            if (!res.ok) throw new Error('Failed');
            router.push('/admin');
            router.refresh();
        } catch (e) {
            alert('Error saving survey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '40px' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>Basic Info</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Survey Title (TR)</label>
                            <input
                                required
                                type="text"
                                value={titleTR}
                                onChange={e => setTitleTR(e.target.value)}
                                placeholder="e.g., Müşteri Memnuniyet Anketi"
                                onBlur={e => handleTitleTranslate(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Survey Title (EN)
                                {translating === 'titleEN' && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--primary)' }}>Translating...</span>}
                            </label>
                            <input
                                required
                                type="text"
                                value={titleEN}
                                onChange={e => setTitleEN(e.target.value)}
                                placeholder="e.g., Customer Satisfaction Survey"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
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
                                        <option value="YES_NO">Yes / No</option>
                                    </select>
                                </div>
                                <div style={{ paddingTop: '32px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={q.required}
                                            onChange={e => updateQuestion(idx, 'required', e.target.checked)}
                                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                        />
                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Required / Zorunlu</span>
                                    </label>
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
                                    onBlur={e => handleAutoTranslate(e.target.value, idx, 'textEN')}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    Question Text (EN)
                                    {translating === `${idx}-textEN` && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--primary)' }}>Translating...</span>}
                                </label>
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
                                    value={q.descriptionTR || ''}
                                    onChange={e => updateQuestion(idx, 'descriptionTR', e.target.value)}
                                    onBlur={e => handleAutoTranslate(e.target.value, idx, 'descriptionEN')}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    Description (EN) (Optional)
                                    {translating === `${idx}-descriptionEN` && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--primary)' }}>Translating...</span>}
                                </label>
                                <input
                                    type="text"
                                    value={q.descriptionEN || ''}
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
                                        <div key={opt.id || oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                placeholder="TR Option"
                                                required
                                                value={opt.textTR}
                                                onChange={e => updateOption(idx, oIdx, 'textTR', e.target.value)}
                                                onBlur={e => handleAutoTranslate(e.target.value, idx, 'textEN', oIdx)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                            />
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <input
                                                    placeholder={translating === `${idx}-${oIdx}-textEN` ? "Translating..." : "EN Option"}
                                                    required
                                                    value={opt.textEN}
                                                    onChange={e => updateOption(idx, oIdx, 'textEN', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                />
                                            </div>
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
                    {loading ? 'Saving...' : (surveyId ? 'Update Survey' : 'Create Survey')}
                </button>
            </div>
        </form>
    );
}
