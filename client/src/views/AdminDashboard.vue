<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Plus, Trash2, FileText, ChevronRight, Edit2 } from 'lucide-vue-next';

interface Survey {
  id: string;
  titleTR: string;
  titleEN: string;
  createdAt: string;
  _count: { responses: number };
}

const surveys = ref<Survey[]>([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  await fetchSurveys();
});

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

const deleteSurvey = async (id: string) => {
  if (!confirm('Bu anketi silmek istediğinize emin misiniz?')) return;
  try {
    await axios.delete(`${API_BASE_URL}/api/survey/${id}`);
    await fetchSurveys();
  } catch (err) {
    alert('Silme işlemi başarısız');
  }
};

const logout = () => {
  localStorage.removeItem('admin_auth');
  router.push({ name: 'home' });
};
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="header-content">
        <div>
          <h1>Anket Paneli</h1>
          <p>Anketlerinizi buradan yönetebilirsiniz.</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/create" class="create-btn">
            <Plus class="icon" /> Yeni Anket Oluştur
          </router-link>
          <button @click="logout" class="logout-btn">Çıkış</button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div v-if="loading" class="loading-state">Yükleniyor...</div>
      <div v-else-if="surveys.length === 0" class="empty-state">
        <p>Henüz hiç anket oluşturulmamış.</p>
        <router-link to="/admin/create" class="link">İlk anketini oluştur &rarr;</router-link>
      </div>
      <div v-else class="survey-list">
        <div v-for="survey in surveys" :key="survey.id" class="survey-item">
          <div class="survey-info">
            <h3>{{ survey.titleTR }}</h3>
            <p>{{ survey.titleEN }}</p>
            <div class="meta">
              <span class="response-count">{{ survey._count?.responses || 0 }} Yanıt</span>
              <span class="dot">·</span>
              <span class="date">{{ new Date(survey.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
          <div class="survey-actions">
            <router-link :to="{ name: 'responses', params: { id: survey.id } }" class="action-btn" title="Yanıtları Gör">
              <FileText class="icon" />
            </router-link>
            <router-link :to="{ name: 'admin-edit', params: { id: survey.id } }" class="action-btn" title="Düzenle">
              <Edit2 class="icon" />
            </router-link>
            <button @click="deleteSurvey(survey.id)" class="action-btn delete" title="Sil">
              <Trash2 class="icon" />
            </button>
            <ChevronRight class="icon chevron" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f1f5f9;
}

.admin-header {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6366f1;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #4f46e5;
}

.logout-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.admin-main {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.survey-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.survey-item {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.survey-item:hover {
  transform: translateX(4px);
}

.survey-info h3 {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.survey-info p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.response-count {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  color: #6366f1;
  font-weight: 600;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.chevron {
  color: #cbd5e1;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 5rem;
  background: white;
  border-radius: 1rem;
  color: #64748b;
}

.link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}
</style>
