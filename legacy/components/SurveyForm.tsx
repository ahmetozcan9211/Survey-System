'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyFormProps {
    survey: any;
    lang: 'tr' | 'en';
    title: string;
}

export default function SurveyForm({ survey, lang: initialLang, title }: SurveyFormProps) {
    const router = useRouter();
    const [lang, setLang] = useState<'tr' | 'en'>(initialLang);
    const [step, setStep] = useState(0); // 0: Info, 1: Questions, 2: Success
    const [submitting, setSubmitting] = useState(false);

    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        country: '',
        address: ''
    });

    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Language content
    const content = {
        tr: {
            personalInfo: 'Kişisel Bilgiler',
            name: 'Ad Soyad',
            email: 'E-posta',
            phone: 'Telefon',
            company: 'Şirket Adı',
            country: 'Ülke',
            address: 'Adres',
            next: 'İlerle',
            submit: 'Gönder',
            submitting: 'Gönderiliyor...',
            successTitle: 'Teşekkürler!',
            successMessage: 'Anketiniz başarıyla gönderildi.',
            required: 'Zorunlu'
        },
        en: {
            personalInfo: 'Personal Information',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            company: 'Company Name',
            country: 'Country',
            address: 'Address',
            next: 'Next',
            submit: 'Submit',
            submitting: 'Submitting...',
            successTitle: 'Thank You!',
            successMessage: 'Your survey has been submitted.',
            required: 'Required'
        }
    }[lang];

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate current step (Personal Info)
        if (step === 0) {
            if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.companyName || !customerInfo.country || !customerInfo.address) {
                alert(lang === 'en' ? 'Please fill all fields' : 'Lütfen tüm alanları doldurunuz');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all required questions
        for (const q of survey.questions) {
            if (q.required) {
                const answer = answers[q.id];
                if (!answer || (typeof answer === 'string' && !answer.trim())) {
                    alert(lang === 'en' ? `Please answer: ${q.textEN}` : `Lütfen cevaplayınız: ${q.textTR}`);
                    return;
                }
            }
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/survey/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    surveyId: survey.id,
                    customerInfo: customerInfo,
                    language: lang,
                    answers
                })
            });

            if (!res.ok) throw new Error('Failed');
            setStep(2);
        } catch (e) {
            alert('Error submitting survey');
            setSubmitting(false);
        }
    };

    if (step === 2) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '16px' }}>{content.successTitle}</h2>
                <p>{content.successMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {lang === 'en' ? 'Please complete the survey below' : 'Lütfen aşağıdaki anketi doldurunuz'}
                </p>
            </header>

            {/* Language Switcher */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                    onClick={() => setLang('tr')}
                    style={{
                        fontWeight: lang === 'tr' ? 'bold' : 'normal',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        backgroundColor: lang === 'tr' ? 'var(--primary)' : 'transparent',
                        color: lang === 'tr' ? 'white' : 'var(--foreground)',
                        cursor: 'pointer',
                        marginRight: '8px'
                    }}
                >
                    TR
                </button>
                <button
                    onClick={() => setLang('en')}
                    style={{
                        fontWeight: lang === 'en' ? 'bold' : 'normal',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        backgroundColor: lang === 'en' ? 'var(--primary)' : 'transparent',
                        color: lang === 'en' ? 'white' : 'var(--foreground)',
                        cursor: 'pointer'
                    }}
                >
                    EN
                </button>
            </div>

            <form onSubmit={step === 0 ? handleNext : handleSubmit}>

                {step === 0 && (
                    <div className="fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 600 }}>{content.personalInfo}</h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.name}</label>
                                <input
                                    required
                                    type="text"
                                    value={customerInfo.fullName}
                                    onChange={e => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.company}</label>
                                <input
                                    required
                                    type="text"
                                    value={customerInfo.companyName}
                                    onChange={e => setCustomerInfo({ ...customerInfo, companyName: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.email}</label>
                                    <input
                                        required
                                        type="email"
                                        value={customerInfo.email}
                                        onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.phone}</label>
                                    <input
                                        required
                                        type="tel"
                                        value={customerInfo.phone}
                                        onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.country}</label>
                                    <input
                                        required
                                        type="text"
                                        value={customerInfo.country}
                                        onChange={e => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>{content.address}</label>
                                    <input
                                        required
                                        type="text"
                                        value={customerInfo.address}
                                        onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="fade-in">
                        {survey.questions.map((q: any, idx: number) => (
                            <div key={q.id} style={{
                                marginBottom: '32px',
                                backgroundColor: 'var(--background)',
                                padding: '20px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>
                                    {lang === 'en' ? q.textEN : q.textTR}
                                    {q.required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
                                    {!q.required && <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '6px' }}>
                                        ({lang === 'en' ? 'Optional' : 'İsteğe bağlı'})
                                    </span>}
                                </p>
                                {(lang === 'tr' ? q.descriptionTR : q.descriptionEN) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {lang === 'tr' ? q.descriptionTR : q.descriptionEN}
                                    </p>
                                )}

                                <div style={{ marginTop: '16px' }}>
                                    {q.type === 'RATE' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {[1, 2, 3, 4, 5].map(val => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => setAnswers({ ...answers, [q.id]: val.toString() })}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            border: '1px solid var(--border)',
                                                            backgroundColor: answers[q.id] === val.toString() ? 'var(--primary)' : 'white',
                                                            color: answers[q.id] === val.toString() ? 'white' : 'var(--foreground)',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '232px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <span>{lang === 'en' ? 'Lowest' : 'En Düşük'}</span>
                                                <span>{lang === 'en' ? 'Highest' : 'En Yüksek'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === 'CHOICE' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {q.options.map((opt: any) => (
                                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={opt.textTR} // Actually we should probably store option ID or text? storing text for now as per scheme
                                                        checked={answers[q.id] === (lang === 'en' ? opt.textEN : opt.textTR)}
                                                        onChange={() => setAnswers({ ...answers, [q.id]: lang === 'en' ? opt.textEN : opt.textTR })}
                                                        style={{ accentColor: 'var(--primary)' }}
                                                    />
                                                    <span>{lang === 'en' ? opt.textEN : opt.textTR}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'TEXT' && (
                                        <textarea
                                            rows={3}
                                            value={answers[q.id] || ''}
                                            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    )}

                                    {q.type === 'YES_NO' && (
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setAnswers({ ...answers, [q.id]: 'Yes' })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: answers[q.id] === 'Yes' ? 'var(--primary)' : 'white',
                                                    color: answers[q.id] === 'Yes' ? 'white' : 'var(--foreground)',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {lang === 'en' ? 'Yes' : 'Evet'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAnswers({ ...answers, [q.id]: 'No' })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: answers[q.id] === 'No' ? 'var(--primary)' : 'white',
                                                    color: answers[q.id] === 'No' ? 'white' : 'var(--foreground)',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {lang === 'en' ? 'No' : 'Hayır'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '32px', textAlign: 'right' }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '16px 40px',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {submitting ? content.submitting : (step === 0 ? content.next : content.submit)}
                    </button>
                </div>

            </form>
        </div>
    );
}
