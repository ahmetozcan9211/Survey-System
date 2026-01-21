'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
    initialResponses: any[];
    questions: any[];
    surveyTitle: { tr: string, en: string };
}

export default function ResponseTable({ initialResponses, questions, surveyTitle }: Props) {
    const [responses, setResponses] = useState(initialResponses);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this response?')) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/survey/response/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            setResponses(responses.filter(r => r.id !== id));
        } catch (e) {
            alert('Error deleting response');
        } finally {
            setDeleting(null);
        }
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF();

        // Add font
        const fontResponse = await fetch('/fonts/Amiri-Regular.ttf');
        const fontBlob = await fontResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(fontBlob);

        reader.onloadend = () => {
            const base64data = reader.result as string;
            // Remove "data:font/ttf;base64," prefix
            const fontBase64 = base64data.split(',')[1];

            doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            doc.setFont('Amiri');

            doc.setFontSize(16);
            doc.text(surveyTitle.tr, 14, 20);
            doc.setFontSize(10);
            doc.text(`Toplam Cevap: ${responses.length}`, 14, 28);

            const head = [
                ['Müşteri', ...questions.map((q, i) => `S${i + 1}`), 'Tarih']
            ];

            const body = responses.map(r => {
                let c = {};
                try { c = JSON.parse(r.customerInfo); } catch { }
                // @ts-ignore
                const customerStr = `${c.fullName || ''}\n${c.companyName || ''}`;

                const answers = questions.map(q => {
                    const a = r.answers.find((ans: any) => ans.questionId === q.id);
                    let val = a ? a.value : '-';
                    if (val === 'Yes') val = 'Evet';
                    if (val === 'No') val = 'Hayır';
                    return val;
                });

                return [customerStr, ...answers, new Date(r.createdAt).toLocaleDateString('tr-TR')];
            });

            autoTable(doc, {
                head: head,
                body: body,
                startY: 35,
                styles: { fontSize: 8, font: 'Amiri' },
                headStyles: { fillColor: [66, 66, 66] }
            });

            doc.save('anket-cevaplari.pdf');
        };
    };

    const handleSingleExport = async (response: any) => {
        const doc = new jsPDF();

        // Add font
        const fontResponse = await fetch('/fonts/Amiri-Regular.ttf');
        const fontBlob = await fontResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(fontBlob);

        reader.onloadend = () => {
            const base64data = reader.result as string;
            const fontBase64 = base64data.split(',')[1];

            doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
            doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
            doc.setFont('Amiri');

            let customer: any = {};
            try {
                customer = JSON.parse(response.customerInfo);
            } catch { }

            const isEn = response.language === 'en';

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text(isEn ? 'Survey Response Document' : 'Anket Cevap Dökümanı', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(isEn ? surveyTitle.en : surveyTitle.tr, 105, 28, { align: 'center' });

            doc.line(20, 35, 190, 35);

            // Details Info Box
            doc.setFillColor(245, 245, 245);
            doc.rect(20, 40, 170, 35, 'F');

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const dateStr = new Date(response.createdAt).toLocaleString(isEn ? 'en-US' : 'tr-TR');
            doc.text(`${isEn ? 'Date' : 'Tarih'}: ${dateStr}`, 25, 48);
            doc.text(`ID: ${response.id}`, 190, 48, { align: 'right' });

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`${customer.fullName || '-'}`, 25, 58);
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`${customer.companyName || '-'}`, 25, 64);
            doc.text(`${customer.email || '-'}  |  ${customer.phone || '-'}`, 25, 70);

            const locStr = `${customer.country || ''} - ${customer.address || ''}`;
            if (locStr.trim() !== '-') doc.text(locStr, 25, 76);

            // Q & A Section
            let yPos = 96;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(isEn ? 'Responses' : 'Cevaplar', 20, 85);

            questions.forEach((q, i) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }

                const answer = response.answers.find((a: any) => a.questionId === q.id);
                let val = answer?.value || (isEn ? 'No Answer' : 'Cevap Yok');

                if (val === 'Yes') val = isEn ? 'Yes' : 'Evet';
                if (val === 'No') val = isEn ? 'No' : 'Hayır';

                // Question Box
                doc.setFillColor(240, 248, 255);
                doc.rect(20, yPos, 170, 8, 'F');
                doc.setFontSize(10);
                // doc.setFont('helvetica', 'bold');
                doc.setTextColor(40, 40, 40);
                const qTitle = `Q${i + 1}: ${isEn ? q.textEN : q.textTR}`;
                doc.text(qTitle, 22, yPos + 6);

                yPos += 14;

                // Answer
                // doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                // Handle long text wrapping
                const answerLines = doc.splitTextToSize(val, 160);
                doc.text(answerLines, 25, yPos);

                yPos += (answerLines.length * 6) + 6;
            });

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                if (isEn) {
                    doc.text(`Page ${i} / ${pageCount}`, 190, 287, { align: 'right' });
                    doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 20, 287);
                } else {
                    doc.text(`Sayfa ${i} / ${pageCount}`, 190, 287, { align: 'right' });
                    doc.text(`Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}`, 20, 287);
                }
            }

            doc.save(`Cevap_${customer.fullName?.replace(/\s+/g, '_') || 'Bilinmeyen'}_${new Date().toISOString().split('T')[0]}.pdf`);
        };
    };

    const [selectedResponse, setSelectedResponse] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResponses = responses.filter(r => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        let c: any = {};
        try { c = JSON.parse(r.customerInfo); } catch { }

        const name = (c.fullName || '').toLowerCase();
        const company = (c.companyName || '').toLowerCase();
        const email = (c.email || '').toLowerCase();

        return name.includes(term) || company.includes(term) || email.includes(term);
    });

    return (
        <div>
            {/* Modal for Details */}
            {selectedResponse && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedResponse(null)}>
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        padding: '30px',
                        borderRadius: 'var(--radius-lg)',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-xl)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedResponse(null)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        >
                            &times;
                        </button>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                            {selectedResponse.language === 'en' ? 'Response Details' : 'Cevap Detayları'}
                        </h2>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Customer Info */}
                            <div style={{ backgroundColor: 'var(--background)', padding: '20px', borderRadius: 'var(--radius)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--primary)' }}>
                                    {selectedResponse.language === 'en' ? 'Customer Information' : 'Müşteri Bilgileri'}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {(() => {
                                        try {
                                            const c = JSON.parse(selectedResponse.customerInfo);
                                            return (
                                                <>
                                                    <div><strong>{selectedResponse.language === 'en' ? 'Name' : 'İsim'}:</strong> {c.fullName}</div>
                                                    <div><strong>{selectedResponse.language === 'en' ? 'Company' : 'Şirket'}:</strong> {c.companyName}</div>
                                                    <div><strong>Email:</strong> {c.email}</div>
                                                    <div><strong>{selectedResponse.language === 'en' ? 'Phone' : 'Telefon'}:</strong> {c.phone}</div>
                                                    <div><strong>{selectedResponse.language === 'en' ? 'Country' : 'Ülke'}:</strong> {c.country || '-'}</div>
                                                    <div><strong>{selectedResponse.language === 'en' ? 'Address' : 'Adres'}:</strong> {c.address || '-'}</div>
                                                </>
                                            );
                                        } catch { return <div>Error parsing info</div> }
                                    })()}
                                </div>
                            </div>

                            {/* Answers */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--primary)' }}>
                                    {selectedResponse.language === 'en' ? 'Answers' : 'Cevaplar'}
                                </h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {questions.map((q, i) => {
                                        const ans = selectedResponse.answers.find((a: any) => a.questionId === q.id);
                                        let val = ans?.value || '-';
                                        if (val === 'Yes') val = selectedResponse.language === 'en' ? 'Yes' : 'Evet';
                                        if (val === 'No') val = selectedResponse.language === 'en' ? 'No' : 'Hayır';

                                        return (
                                            <div key={q.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                                    {i + 1}. {selectedResponse.language === 'en' ? q.textEN : q.textTR}
                                                </div>
                                                <div style={{ color: 'var(--foreground)' }}>{val}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleSingleExport(selectedResponse)}
                                style={{
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    padding: '10px 24px',
                                    borderRadius: 'var(--radius)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {selectedResponse.language === 'en' ? 'Download PDF' : 'PDF İndir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <input
                        type="text"
                        placeholder="Ara: İsim, Şirket veya E-posta..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    />
                </div>
                <p style={{ alignSelf: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {filteredResponses.length} toplam cevap
                </p>
                <button
                    onClick={handleExportPDF}
                    style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Tabloyu İndir (PDF)
                </button>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Müşteri</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Şirket</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Dil</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Tarih</th>
                            <th style={{ padding: '16px', width: '180px', textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResponses.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {searchTerm ? 'Sonuç bulunamadı.' : 'Henüz cevap yok.'}
                                </td>
                            </tr>
                        ) : filteredResponses.map(response => {
                            let customer: any;
                            try {
                                customer = JSON.parse(response.customerInfo);
                            } catch {
                                customer = {};
                            }

                            return (
                                <tr
                                    key={response.id}
                                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    onClick={() => setSelectedResponse(response)}
                                    // Add hover effect via CSS classes generally, but here inline style for simple hover is hard. 
                                    // We rely on simple structure.
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '16px', fontWeight: 600 }}>
                                        {customer.fullName}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                        {customer.companyName}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: response.language === 'en' ? '#e3f2fd' : '#fff3e0',
                                            color: response.language === 'en' ? '#1565c0' : '#e65100',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {response.language === 'en' ? 'EN' : 'TR'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                        {new Date(response.createdAt).toLocaleDateString(response.language === 'en' ? 'en-US' : 'tr-TR')}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSingleExport(response); }}
                                            style={{
                                                color: 'var(--primary)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                marginRight: '12px'
                                            }}
                                            title="PDF İndir"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(response.id); }}
                                            disabled={deleting === response.id}
                                            style={{
                                                color: 'var(--error)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                opacity: deleting === response.id ? 0.5 : 1
                                            }}
                                        >
                                            {deleting === response.id ? '...' : 'Sil'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
