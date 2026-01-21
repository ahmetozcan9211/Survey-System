<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SurveyEditor from '../components/SurveyEditor.vue';
import { ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const survey = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/survey/${route.params.id}`);
    survey.value = res.data;
  } catch (err) {
    console.error('Error fetching survey:', err);
    alert('Anket yüklenirken hata oluştu.');
    router.push('/admin');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="admin-edit">
    <div class="container">
      <div class="back-link">
        <router-link to="/admin" class="link">
          <ChevronLeft class="icon" /> Panel'e Dön
        </router-link>
      </div>

      <header class="header">
        <h1>Anketi Düzenle</h1>
        <p>Anket başlığını, sorularını ve seçeneklerini güncelleyin.</p>
      </header>

      <div v-if="loading" class="center">Yükleniyor...</div>
      <SurveyEditor v-else-if="survey" :initialData="survey" :surveyId="survey.id" />
    </div>
  </div>
</template>

<style scoped>
.admin-edit {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 2rem;
}

.link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

p {
  color: #64748b;
}

.center {
  text-align: center;
  padding: 5rem;
  color: #64748b;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
