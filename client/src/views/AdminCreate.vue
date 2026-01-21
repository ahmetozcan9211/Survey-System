<script setup lang="ts">
import SurveyEditor from '../components/SurveyEditor.vue';
import { ChevronLeft } from 'lucide-vue-next';

// router removed as it was unused
</script>

<template>
  <div class="admin-create">
    <div class="container">
      <div class="back-link">
        <router-link to="/admin" class="link">
          <ChevronLeft class="icon" /> Panel'e Dön
        </router-link>
      </div>

      <header class="header">
        <h1>Yeni Anket Oluştur</h1>
        <p>Anket sorularını ve seçeneklerini buradan tasarlayın.</p>
      </header>

      <SurveyEditor />
    </div>
  </div>
</template>

<style scoped>
.admin-create {
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

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
