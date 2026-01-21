<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock } from 'lucide-vue-next';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: username.value,
      password: password.value
    });
    
    if (res.data.success) {
      localStorage.setItem('admin_auth', 'true');
      router.push({ name: 'admin' });
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Giriş başarısız';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="icon-header">
        <Lock />
      </div>
      <h2>Yönetici Girişi</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Kullanıcı Adı</label>
          <input v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label>Şifre</label>
          <input v-model="password" type="password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.icon-header {
  width: 60px;
  height: 60px;
  background: #f1f5f9;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #6366f1;
}

h2 {
  margin-bottom: 2rem;
  color: #1e293b;
  font-weight: 700;
}

.form-group {
  text-align: left;
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #6366f1;
}

.error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #4f46e5;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
