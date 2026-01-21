<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ResponseTable from '../components/ResponseTable.vue';
import { ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const survey = ref<any>(null);
const responses = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [surveyRes, responsesRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/survey/${route.params.id}`),
      axios.get(`${API_BASE_URL}/api/survey/${route.params.id}/responses`)
    ]);
    survey.value = surveyRes.data;
    responses.value = responsesRes.data;
  } catch (err) {
    console.error('Error fetching responses:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="responses-view">
    <div class="container">
      <div class="back-link">
        <router-link to="/admin" class="link">
          <ChevronLeft class="icon" /> Panel'e Dön
        </router-link>
      </div>

      <header v-if="survey" class="header">
        <h1>Anket Yanıtları</h1>
        <p>{{ survey.titleTR }} / {{ survey.titleEN }}</p>
      </header>

      <div v-if="loading" class="center">Yükleniyor...</div>
      <div v-else-if="survey">
        <ResponseTable 
          :initialResponses="responses" 
          :questions="survey.questions" 
          :surveyTitle="{ tr: survey.titleTR, en: survey.titleEN }" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.responses-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
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
