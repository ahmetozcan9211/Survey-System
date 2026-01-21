```
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  Globe,
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  Calendar,
  Layers
} from 'lucide-vue-next';

interface Survey {
  id: string;
  titleTR: string;
  titleEN: string;
  createdAt: string;
  _count?: { responses: number };
}

const router = useRouter();
const surveys = ref<Survey[]>([]);
const lang = ref<'tr' | 'en'>('tr');
const loading = ref(true);

const content = {
  tr: {
    portalName: "IMICRYL ANKET SISTEMI",
    welcome: "Hoş Geldiniz",
    subtitle: "Aktif anket listesi ve kurumsal araştırmalar.",
    activeSurveys: "Yayındaki Anketler",
    start: "Anketi Aç",
    viewAdmin: "Yönetici Paneli",
    loading: "Veriler yükleniyor...",
    noSurveys: "Henüz yayında olan bir araştırma bulunmuyor.",
    footer: "© 2026 Kurumsal Geri Bildirim Platformu"
  },
  en: {
    portalName: "IMICRYL SURVILANCE SYSTEM",
    welcome: "Welcome",
    subtitle: "List of active surveys and corporate researches.",
    activeSurveys: "Active Surveys",
    start: "Open Survey",
    viewAdmin: "Admin Dashboard",
    loading: "Loading data...",
    noSurveys: "No surveys are currently active.",
    footer: "© 2026 Enterprise Feedback Platform"
  }
};

const toggleLang = () => {
  lang.value = lang.value === 'tr' ? 'en' : 'tr';
};

const fetchSurveys = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/survey`);
    surveys.value = res.data;
  } catch (err) {
    console.error('Error fetching surveys:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSurveys();
});

const startSurvey = (surveyId: string) => {
  router.push({ name: 'survey', params: { id: surveyId }, query: { lang: lang.value } });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(lang.value === 'tr' ? 'tr-TR' : 'en-US');
};
</script>

<template>
  <div class="portal">
    <!-- Clean Professional Header -->
    <header class="header">
      <div class="h-container">
        <div class="brand">
          <div class="brand-logo">
            <img src="/SurveyLogo.png" alt="Logo" />
          </div>
          <h1>{{ content[lang].portalName }}</h1>
        </div>
        <div class="h-actions">
          <button @click="toggleLang" class="btn-secondary">
            <Globe class="icon-sm" />
            {{ lang === 'tr' ? 'EN' : 'TR' }}
          </button>
          <router-link to="/admin" class="btn-admin">
            <LayoutDashboard class="icon-sm" />
            {{ content[lang].viewAdmin }}
          </router-link>
        </div>
      </div>
    </header>

    <!-- Professional Hero Area (Non-Marketing) -->
    <div class="hero">
      <div class="hero-inner">
        <span class="badge">{{ content[lang].welcome }}</span>
        <h2>{{ content[lang].subtitle }}</h2>
      </div>
    </div>

    <!-- Survey Grid -->
    <main class="main">
      <div class="section-title">
        <Layers class="icon-accent" />
        <h3>{{ content[lang].activeSurveys }}</h3>
      </div>

      <div v-if="loading" class="state-box">
        <div class="loader"></div>
        <p>{{ content[lang].loading }}</p>
      </div>

      <div v-else-if="surveys.length === 0" class="state-box">
        <p class="muted">{{ content[lang].noSurveys }}</p>
      </div>

      <div v-else class="grid">
        <div v-for="survey in surveys" :key="survey.id" class="card">
          <div class="card-meta">
            <span class="meta-item">
              <Calendar class="icon-xs" />
              {{ formatDate(survey.createdAt) }}
            </span>
            <ClipboardList class="icon-xs muted" />
          </div>
          <h4 class="card-title">{{ lang === 'tr' ? survey.titleTR : survey.titleEN }}</h4>
          <button @click="startSurvey(survey.id)" class="btn-primary">
            {{ content[lang].start }}
            <ArrowRight class="icon-sm" />
          </button>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>{{ content[lang].footer }}</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.portal {
  min-height: 100vh;
  background-color: #fcfdff;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.h-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo img {
  height: 36px;
  width: auto;
}

.brand h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.h-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Buttons */
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid #e2e8f0;
  background: transparent;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #1e293b;
}

.btn-admin {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-admin:hover {
  background: #e2e8f0;
}

/* Hero */
.hero {
  background: #f8fafc;
  padding: 4rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #6366f115;
  color: #6366f1;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 2rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.hero h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}

/* Main Content */
.main {
  flex-grow: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.icon-accent {
  width: 1.5rem;
  height: 1.5rem;
  color: #6366f1;
}

.section-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #334155;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.card:hover {
  border-color: #6366f140;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  transform: translateY(-4px);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.btn-primary {
  width: 100%;
  padding: 0.9rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4f46e5;
  box-shadow: 0 8px 15px -4px rgba(99, 102, 241, 0.3);
}

/* Footer */
.footer {
  padding: 3rem 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  border-top: 1px solid #f1f5f9;
}

/* States */
.state-box {
  background: white;
  border: 1px dashed #e2e8f0;
  border-radius: 1rem;
  padding: 4rem;
  text-align: center;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #f1f5f9;
  border-top-color: #6366f1;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.muted { color: #94a3b8; }
.icon-sm { width: 1.1rem; height: 1.1rem; }
.icon-xs { width: 0.9rem; height: 0.9rem; }

@media (max-width: 768px) {
  .hero h2 { font-size: 1.75rem; }
  .grid { grid-template-columns: 1fr; }
  .btn-admin span { display: none; }
}
</style>
