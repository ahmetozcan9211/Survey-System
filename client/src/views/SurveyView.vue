<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SurveyForm from '../components/SurveyForm.vue';

const route = useRoute();
const survey = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const lang = ref<'tr' | 'en'>((route.query.lang as 'tr' | 'en') || 'tr');

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/survey/${route.params.id}`);
    survey.value = res.data;
  } catch (err) {
    console.error('Error fetching survey:', err);
    error.value = 'Survey not found or server error';
  } finally {
    loading.value = false;
  }
});

const surveyTitle = () => {
  if (!survey.value) return '';
  return lang.value === 'en' ? survey.value.titleEN : survey.value.titleTR;
};
</script>

<template>
  <div class="survey-page">
    <div v-if="loading" class="center">Loading survey...</div>
    <div v-else-if="error" class="center error">{{ error }}</div>
    <div v-else class="survey-container">
      <SurveyForm :survey="survey" :lang="lang" :title="surveyTitle()" />
    </div>
  </div>
</template>

<style scoped>
.survey-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2.5rem 1rem;
}

.survey-container {
  max-width: 800px;
  margin: 0 auto;
}

.center {
  text-align: center;
  padding: 5rem;
  font-size: 1.25rem;
  color: #64748b;
}

.error {
  color: #ef4444;
}
</style>
