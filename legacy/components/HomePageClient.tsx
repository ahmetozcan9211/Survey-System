'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Survey } from '@prisma/client';

export default function HomePageClient({ surveys }: { surveys: Survey[] }) {
    const [lang, setLang] = useState<'tr' | 'en'>('tr');

    const content = {
        tr: {
            title: 'Müşteri Deneyimi Platformu',
            subtitle: 'Servisimiz hakkındaki görüşleriniz bizim için çok değerli. Lütfen aşağıdan ilgili anketi seçerek deneyiminizi paylaşın.',
            activeSurveys: 'Aktif Anketler',
            activeSurveysSubtitle: 'Size uygun olan anketi seçip hemen başlayabilirsiniz.',
            start: 'Başla',
            noSurveys: 'Şu an aktif anket bulunmuyor.',
            noSurveysSub: 'Lütfen daha sonra tekrar kontrol ediniz.',
            footer: 'Müşteri Geri Bildirim Sistemi. Tüm hakları saklıdır.',
            available: 'Adet Mevcut'
        },
        en: {
            title: 'Customer Experience Platform',
            subtitle: 'Your feedback is very valuable to us. Please select a survey below to share your experience.',
            activeSurveys: 'Active Surveys',
            activeSurveysSubtitle: 'Select a survey below to start providing feedback.',
            start: 'Start Survey',
            noSurveys: 'No active surveys at the moment.',
            noSurveysSub: 'Please check back later.',
            footer: 'Customer Feedback System. All rights reserved.',
            available: 'Available'
        }
    }[lang];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>

            {/* Language Switcher Fixed Top Right */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => setLang('tr')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: lang === 'tr' ? 'white' : 'rgba(255,255,255,0.2)',
                        color: lang === 'tr' ? 'var(--primary)' : 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    TR
                </button>
                <button
                    onClick={() => setLang('en')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: lang === 'en' ? 'white' : 'rgba(255,255,255,0.2)',
                        color: lang === 'en' ? 'var(--primary)' : 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    EN
                </button>
            </div>

            {/* Hero Section */}
            <div className="hero-gradient" style={{ padding: '100px 20px 140px', textAlign: 'center', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="fade-in" style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                        {lang === 'tr' ? (
                            <>Müşteri Deneyimi<br />Platformu</>
                        ) : (
                            <>Customer Experience<br />Platform</>
                        )}
                    </h1>
                    <p className="fade-in" style={{ fontSize: '1.25rem', opacity: 0.95, fontWeight: 300, maxWidth: '600px', margin: '0 auto' }}>
                        {content.subtitle}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1100px', margin: '-100px auto 0', padding: '0 20px', width: '100%', flex: 1, zIndex: 10 }}>
                <div className="glass-panel" style={{ borderRadius: '24px', padding: '50px', minHeight: '500px' }}>

                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                            {content.activeSurveys}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {content.activeSurveysSubtitle}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        {surveys.map((survey) => (
                            <div key={survey.id} className="survey-card">
                                <div style={{ marginBottom: '24px', flex: 1 }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px',
                                        fontSize: '1.5rem'
                                    }}>
                                        📝
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                                        {lang === 'tr' ? (survey as any).titleTR : (survey as any).titleEN}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                                        {lang === 'tr' ? (survey as any).titleEN : (survey as any).titleTR}
                                        {/* Showing alternative title as subtitle if desired, or maybe just description if we had one. 
                                            For now, let's just show the other language title as secondary info or hide it?
                                            The user request implies full switch. Let's just show the relevant title.
                                        */}
                                    </p>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <Link
                                        href={`/survey/${survey.id}?lang=${lang}`}
                                        className="btn btn-primary"
                                        style={{ padding: '12px 20px', width: '100%' }}
                                    >
                                        {content.start}
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {surveys.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}>📭</div>
                                <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{content.noSurveys}</p>
                                <p style={{ fontSize: '0.95rem', marginTop: '8px', opacity: 0.8 }}>{content.noSurveysSub}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', opacity: 0.6 }}>
                &copy; {new Date().getFullYear()} {content.footer}
            </footer>
        </div>
    );
}
