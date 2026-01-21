<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Trash2, Plus, Globe } from 'lucide-vue-next';

const props = defineProps<{
  initialData?: any;
  surveyId?: string;
}>();

const router = useRouter();
const loading = ref(false);
const translating = ref<string | null>(null);

const titleTR = ref(props.initialData?.titleTR || '');
const titleEN = ref(props.initialData?.titleEN || '');
const revision = ref(props.initialData?.revision || '1.0');
const type = ref(props.initialData?.type || 'SATISFACTION');

const questions = ref<any[]>(props.initialData ? props.initialData.questions.map((q: any) => ({
  ...q,
  options: q.options || [],
  required: q.required !== undefined ? q.required : true
})) : [
  { id: 'new-' + Date.now(), type: 'RATE', textTR: '', textEN: '', descriptionTR: '', descriptionEN: '', required: true, options: [] }
]);

const addQuestion = () => {
  questions.value.push({
    id: 'new-' + Date.now(),
    type: 'RATE',
    textTR: '',
    textEN: '',
    descriptionTR: '',
    descriptionEN: '',
    required: true,
    options: []
  });
};

const removeQuestion = (index: number) => {
  questions.value.splice(index, 1);
};

const addOption = (qIndex: number) => {
  questions.value[qIndex].options.push({ id: 'new-' + Date.now(), textTR: '', textEN: '' });
};

const removeOption = (qIndex: number, oIndex: number) => {
  questions.value[qIndex].options.splice(oIndex, 1);
};

const handleAutoTranslate = async (text: string, qIndex: number, field: string, oIndex: number = -1) => {
  let targetValue = oIndex === -1 ? questions.value[qIndex][field] : questions.value[qIndex].options[oIndex][field];
  if (!text || (targetValue && targetValue.trim() !== '')) return;

  const indicatorId = oIndex === -1 ? `${qIndex}-${field}` : `${qIndex}-${oIndex}-${field}`;
  translating.value = indicatorId;

  try {
    const res = await axios.post(`${API_BASE_URL}/api/translate`, { text, targetLang: 'en' });
    if (res.data.translatedText) {
      if (oIndex === -1) {
        questions.value[qIndex][field] = res.data.translatedText;
      } else {
        questions.value[qIndex].options[oIndex][field] = res.data.translatedText;
      }
    }
  } catch (e) {
    console.error('Translation failed', e);
  } finally {
    translating.value = null;
  }
};

const handleTitleTranslate = async () => {
  if (!titleTR.value || titleEN.value.trim() !== '') return;
  translating.value = 'titleEN';
  try {
    const res = await axios.post(`${API_BASE_URL}/api/translate`, { text: titleTR.value, targetLang: 'en' });
    if (res.data.translatedText) titleEN.value = res.data.translatedText;
  } finally {
    translating.value = null;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const payload = {
      titleTR: titleTR.value,
      titleEN: titleEN.value,
      revision: revision.value,
      type: type.value,
      questions: questions.value.map((q, i) => ({
        ...q,
        order: i + 1,
        id: q.id.toString().startsWith('new-') ? undefined : q.id,
        options: q.options.map((opt: any) => ({
          ...opt,
          id: opt.id && opt.id.toString().startsWith('new-') ? undefined : opt.id
        }))
      }))
    };

    const url = props.surveyId ? `${API_BASE_URL}/api/survey/${props.surveyId}` : `${API_BASE_URL}/api/survey/create`;
    const method = props.surveyId ? 'put' : 'post';

    await axios({ method, url, data: payload });
    router.push('/admin');
  } catch (err) {
    alert('Anket kaydedilirken hata oluştu');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="editor-form">
    <!-- Basic Info -->
    <div class="card basic-info">
      <h3>Genel Bilgiler</h3>
      <div class="field-grid">
        <div class="field">
          <label>Anket Başlığı (TR)</label>
          <div class="field-with-btn">
            <input v-model="titleTR" required type="text" placeholder="TR Başlık" />
            <button type="button" @click="handleTitleTranslate" :disabled="translating === 'titleEN'" class="inline-btn" title="Çevir">
              <Globe class="icon" />
            </button>
          </div>
        </div>
        <div class="field">
          <label>Anket Başlığı (EN) <span v-if="translating === 'titleEN'" class="translating">Çevriliyor...</span></label>
          <input v-model="titleEN" required type="text" />
        </div>
        <div class="field">
          <label>Revizyon Numarası</label>
          <input v-model="revision" required type="text" placeholder="Örn: 1.1" />
        </div>
        <div class="field full">
          <label>Anket Tipi</label>
          <select v-model="type">
            <option value="SATISFACTION">Müşteri Memnuniyeti</option>
            <option value="SURVEILLANCE">Satış Sonrası Takip</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Questions -->
    <div class="questions-header">
      <h2>Sorular</h2>
      <button type="button" @click="addQuestion" class="add-q-btn">
        <Plus class="icon" /> Soru Ekle
      </button>
    </div>

    <div class="questions-list">
      <div v-for="(q, idx) in questions" :key="q.id" class="card question-card">
        <div class="q-header">
          <span class="q-number">Soru {{ idx + 1 }}</span>
          <button type="button" @click="removeQuestion(idx)" class="remove-btn">
            <Trash2 class="icon" /> Sil
          </button>
        </div>

        <div class="q-row">
          <div class="field q-type">
            <label>Soru Tipi</label>
            <select v-model="q.type">
              <option value="RATE">Puanlama (1-5)</option>
              <option value="CHOICE">Çoktan Seçmeli</option>
              <option value="TEXT">Metin Yanıt</option>
              <option value="YES_NO">Evet / Hayır</option>
            </select>
          </div>
          <div class="field q-required">
            <label class="checkbox-label">
              <input type="checkbox" v-model="q.required" />
              Zorunlu Soru
            </label>
          </div>
        </div>

        <div class="field-grid">
          <div class="field">
            <label>Soru Metni (TR)</label>
            <div class="field-with-btn">
              <input v-model="q.textTR" required type="text" placeholder="Soru Metni (TR)" />
              <button type="button" @click="handleAutoTranslate(q.textTR, Number(idx), 'textEN')" :disabled="translating === `${idx}-textEN`" class="inline-btn" title="Çevir">
                <Globe class="icon" />
              </button>
            </div>
          </div>
          <div class="field">
            <label>Soru Metni (EN) <span v-if="translating === `${idx}-textEN`" class="translating">...</span></label>
            <input v-model="q.textEN" required type="text" />
          </div>
          <div class="field">
            <label>Açıklama (TR) - İsteğe bağlı</label>
            <div class="field-with-btn">
              <input v-model="q.descriptionTR" type="text" placeholder="Açıklama (TR)" />
              <button type="button" @click="handleAutoTranslate(q.descriptionTR, Number(idx), 'descriptionEN')" :disabled="translating === `${idx}-descriptionEN`" class="inline-btn" title="Çevir">
                <Globe class="icon" />
              </button>
            </div>
          </div>
          <div class="field">
            <label>Açıklama (EN) - İsteğe bağlı <span v-if="translating === `${idx}-descriptionEN`" class="translating">...</span></label>
            <input v-model="q.descriptionEN" type="text" />
          </div>
        </div>

        <!-- Choice Options -->
        <div v-if="q.type === 'CHOICE'" class="options-area">
          <label>Seçenekler</label>
          <div v-for="(opt, oIdx) in q.options" :key="opt.id" class="option-row">
            <div class="field-with-btn">
              <input v-model="opt.textTR" placeholder="TR Seçenek" required />
              <button type="button" @click="handleAutoTranslate(opt.textTR, Number(idx), 'textEN', Number(oIdx))" :disabled="translating === `${idx}-${oIdx}-textEN`" class="inline-btn" title="Çevir">
                <Globe class="icon" />
              </button>
            </div>
            <input v-model="opt.textEN" :placeholder="translating === `${idx}-${oIdx}-textEN` ? '...' : 'EN Seçenek'" required />
            <button type="button" @click="removeOption(Number(idx), Number(oIdx))" class="remove-opt">&times;</button>
          </div>
          <button type="button" @click="addOption(idx)" class="add-opt-btn">+ Seçenek Ekle</button>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="loading" class="save-btn">
        {{ loading ? 'Kaydediliyor...' : (surveyId ? 'Güncelle' : 'Anketi Oluştur') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.editor-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

h3 {
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.full {
  grid-column: span 2;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
}

input, select {
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #6366f1;
}

.field-with-btn {
  display: flex;
  gap: 0.5rem;
}

.field-with-btn input {
  flex: 1;
}

.inline-btn {
  padding: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.inline-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #f5f3ff;
}

.inline-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.translating {
  color: #6366f1;
  font-size: 0.75rem;
  font-weight: normal;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-q-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e293b;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.q-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.q-number {
  color: #6366f1;
  font-weight: 800;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ef4444;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.q-row {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 1.5rem;
}

.options-area {
  margin-top: 1.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.option-row input {
  flex: 1;
}

.remove-opt {
  color: #ef4444;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.add-opt-btn {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #6366f1;
  background: none;
  border: 1px dashed #6366f1;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.form-actions {
  text-align: right;
  margin-bottom: 4rem;
}

.save-btn {
  background: #6366f1;
  color: white;
  padding: 1rem 3rem;
  border-radius: 1rem;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
}

.save-btn:disabled {
  opacity: 0.7;
}

.icon {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
