<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Search, Download, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  initialResponses: any[];
  questions: any[];
  surveyTitle: { tr: string, en: string };
}>();

const responses = ref(props.initialResponses);
const searchTerm = ref('');
const deleting = ref<string | null>(null);
const selectedResponse = ref<any>(null);

const filteredResponses = computed(() => {
  if (!searchTerm.value) return responses.value;
  const term = searchTerm.value.toLowerCase();
  return responses.value.filter(r => {
    let c: any = {};
    try { c = JSON.parse(r.customerInfo); } catch { }
    return (c.fullName || '').toLowerCase().includes(term) ||
           (c.companyName || '').toLowerCase().includes(term) ||
           (c.email || '').toLowerCase().includes(term);
  });
});

const handleDelete = async (id: string) => {
  if (!confirm('Bu yanıtı silmek istediğinize emin misiniz?')) return;
  deleting.value = id;
  try {
    await axios.delete(`${API_BASE_URL}/api/survey/response/${id}`);
    responses.value = responses.value.filter(r => r.id !== id);
  } catch (err) {
    alert('Silme hatası');
  } finally {
    deleting.value = null;
  }
};

const preparePDF = async () => {
  const doc = new jsPDF();
  try {
    const fontRes = await fetch('/fonts/Roboto-Regular.ttf');
    if (!fontRes.ok) throw new Error('Font not found');
    const fontBlob = await fontRes.blob();
    const fontData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fontBlob);
    });
    const fontBase64 = fontData.split(',')[1] || '';
    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
  } catch (err) {
    console.warn('Turkish font loading failed, using default font', err);
  }
  return doc;
};

const handleExportPDF = async () => {
  const doc = await preparePDF();
  const hasRoboto = !!doc.getFontList().Roboto;
  
  // Set font to ensure text() and table use it
  if (hasRoboto) {
    try { doc.setFont('Roboto'); } catch {}
  }
  
  doc.setFontSize(16);
  doc.text(props.surveyTitle.tr || 'Anket Yanitlari', 14, 20);
  if (props.initialResponses[0]?.survey?.revision) {
    doc.setFontSize(10);
    doc.text(`Rev: ${props.initialResponses[0].survey.revision}`, doc.internal.pageSize.width - 30, 20);
  }
  
  const head = [['Müşteri', ...props.questions.map((_, i) => `S${i + 1}`), 'Tarih']];
  const body = filteredResponses.value.map(r => {
    let c: any = {};
    try { c = JSON.parse(r.customerInfo); } catch { }
    const ansList = props.questions.map(q => {
      const a = (r.answers || []).find((ans: any) => ans.questionId === q.id);
      return a ? String(a.value) : '-';
    });
    return [c.fullName || '-', ...ansList, new Date(r.createdAt).toLocaleDateString()];
  });

  autoTable(doc, { 
    head, 
    body, 
    startY: 30,
    styles: { 
      font: hasRoboto ? 'Roboto' : 'helvetica',
      fontSize: 8 // Smaller font for bulk table to fit more columns
    },
    margin: { horizontal: 10 },
    didDrawPage: (data) => {
      // Add page number
      doc.setFontSize(8);
      doc.text(`Sayfa ${data.pageNumber}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }
  });
  doc.save('anket-yanitlari.pdf');
};

const handleExportDetailPDF = async (response: any) => {
  const doc = await preparePDF();
  try { doc.setFont('Roboto'); } catch {}

  let c: any = {};
  try { c = JSON.parse(response.customerInfo); } catch { }

  doc.setFontSize(18);
  doc.text(props.surveyTitle.tr, 14, 20);
  if (response.survey?.revision) {
    doc.setFontSize(10);
    doc.text(`Rev: ${response.survey.revision}`, doc.internal.pageSize.width - 30, 20);
  }
  
  doc.setFontSize(12);
  doc.text('Müşteri Bilgileri:', 14, 35);
  doc.text(`İsim: ${c.fullName || '-'}`, 14, 45);
  doc.text(`Şirket: ${c.companyName || '-'}`, 14, 52);
  doc.text(`E-posta: ${c.email || '-'}`, 14, 59);
  doc.text(`Telefon: ${c.phone || '-'}`, 14, 66);
  doc.text(`Dil: ${response.language.toUpperCase()}`, 14, 73);
  doc.text(`Tarih: ${new Date(response.createdAt).toLocaleString()}`, 14, 80);

  const head = [['Soru', 'Cevap']];
  const body = props.questions.map((q, i) => {
    const a = response.answers.find((ans: any) => ans.questionId === q.id);
    const qText = response.language === 'en' ? q.textEN : q.textTR;
    return [`${i + 1}. ${qText}`, a ? a.value : '-'];
  });

  autoTable(doc, { 
    head, 
    body, 
    startY: 90,
    styles: { 
      font: doc.getFontList().Roboto ? 'Roboto' : 'helvetica',
      overflow: 'linebreak', 
      cellWidth: 'wrap' 
    },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 'auto' } }
  });

  doc.save(`yanit-${c.fullName || 'detay'}.pdf`);
};

const openDetails = (response: any) => {
  selectedResponse.value = response;
};
</script>

<template>
  <div class="response-table-area">
    <div class="table-actions">
      <div class="search-box">
        <Search class="search-icon" />
        <input v-model="searchTerm" placeholder="Müşteri, şirket veya e-posta ara..." />
      </div>
      <button @click="handleExportPDF" class="export-btn">
        <Download class="icon" /> Tabloyu İndir (PDF)
      </button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Müşteri / Şirket</th>
            <th>Dil</th>
            <th>Tarih</th>
            <th class="actions-th">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredResponses" :key="r.id" @click="openDetails(r)">
            <td>
              <div class="customer-info" v-if="(() => { try { return JSON.parse(r.customerInfo); } catch { return {}; } })() as any">
                <span class="name">{{ (JSON.parse(r.customerInfo) as any).fullName }}</span>
                <span class="company">{{ (JSON.parse(r.customerInfo) as any).companyName }}</span>
              </div>
            </td>
            <td>
              <span :class="['lang-tag', r.language]">{{ r.language.toUpperCase() }}</span>
            </td>
            <td>{{ new Date(r.createdAt).toLocaleDateString() }}</td>
            <td class="actions-td">
              <button @click.stop="handleDelete(r.id)" :disabled="deleting === r.id" class="delete-btn">
                <Trash2 class="icon" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredResponses.length === 0">
            <td colspan="4" class="empty-msg">Yanıt bulunamadı.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedResponse" class="modal-overlay" @click="selectedResponse = null">
      <div class="modal" @click.stop>
        <header>
          <h2>Yanıt Detayı</h2>
          <div class="modal-header-actions">
            <button @click="handleExportDetailPDF(selectedResponse)" class="detail-export-btn">
              <Download class="icon" /> PDF İndir
            </button>
            <button @click="selectedResponse = null" class="close-btn">&times;</button>
          </div>
        </header>
        <div class="modal-body">
          <div class="info-section">
            <h4>Müşteri Bilgileri</h4>
            <div class="info-grid" v-if="JSON.parse(selectedResponse.customerInfo) as any">
              <p><strong>İsim:</strong> {{ (JSON.parse(selectedResponse.customerInfo) as any).fullName }}</p>
              <p><strong>Şirket:</strong> {{ (JSON.parse(selectedResponse.customerInfo) as any).companyName }}</p>
              <p><strong>E-posta:</strong> {{ (JSON.parse(selectedResponse.customerInfo) as any).email }}</p>
              <p><strong>Telefon:</strong> {{ (JSON.parse(selectedResponse.customerInfo) as any).phone }}</p>
            </div>
          </div>
          <div class="answers-section">
            <h4>Soru ve Yanıtlar</h4>
            <div v-for="(q, i) in props.questions" :key="q.id" class="answer-item">
              <p class="q-text">{{ i + 1 }}. {{ selectedResponse.language === 'en' ? q.textEN : q.textTR }}</p>
              <p class="a-text">{{ selectedResponse.answers.find((a: any) => a.questionId === q.id)?.value || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 1.1rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

tr:hover {
  background: #f8fafc;
  cursor: pointer;
}

.customer-info .name {
  display: block;
  font-weight: 700;
  color: #1e293b;
}

.customer-info .company {
  font-size: 0.85rem;
  color: #64748b;
}

.lang-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.lang-tag.tr { background: #fee2e2; color: #991b1b; }
.lang-tag.en { background: #dbeafe; color: #1e40af; }

.actions-td, .actions-th {
  text-align: right;
}

.delete-btn {
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.empty-msg {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center; justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.close-btn {
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.info-section, .answers-section {
  margin-bottom: 2rem;
}

h4 {
  color: #6366f1;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.answer-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.q-text { font-weight: 600; margin-bottom: 0.25rem; }
.a-text { color: #475569; }

.icon { width: 1.1rem; height: 1.1rem; }
</style>
