<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const props = defineProps<{
  survey: any;
  lang: 'tr' | 'en';
  title: string;
}>();

const lang = ref<'tr' | 'en'>(props.lang);
const step = ref(0); // 0: Info, 1: Questions, 2: Success
const submitting = ref(false);

const customerInfo = ref({
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  country: '',
  address: ''
});

const answers = ref<Record<string, string>>({});

const kvkkAccepted = ref(false);
const showKvkkModal = ref(false);

// Math CAPTCHA
const captchaNum1 = ref(0);
const captchaNum2 = ref(0);
const captchaInput = ref('');

const generateCaptcha = () => {
  captchaNum1.value = Math.floor(Math.random() * 10) + 1;
  captchaNum2.value = Math.floor(Math.random() * 10) + 1;
  captchaInput.value = '';
};

// Generate on mount
generateCaptcha();

const isCaptchaCorrect = computed(() => {
  return parseInt(captchaInput.value) === (captchaNum1.value + captchaNum2.value);
});

const content = computed(() => {
  const dict = {
    tr: {
      personalInfo: 'Kişisel Bilgiler',
      name: 'Ad Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      company: 'Şirket Adı',
      country: 'Ülke',
      address: 'Adres',
      next: 'İlerle',
      submit: 'Gönder',
      submitting: 'Gönderiliyor...',
      successTitle: 'Teşekkürler!',
      successMessage: 'Anketiniz başarıyla gönderildi.',
      required: 'Zorunlu',
      fillAll: 'Lütfen tüm alanları doldurunuz',
      answerRequired: 'Lütfen cevaplayınız',
      kvkkText: 'KVKK metnini okudum ve onaylıyorum.',
      kvkkRead: 'Metni Oku',
      botCheck: 'Güvenlik Doğrulaması',
      captchaText: 'Lütfen işlemin sonucunu yazınız:',
      kvkkModalTitle: 'KVKK Aydınlatma Metni',
      kvkkLongText: `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla şirketimiz tarafından işlenmektedir. Bu anket kapsamında toplanan ad, soyad, e-posta, telefon ve şirket bilgileriniz sadece kurumsal araştırma ve analiz süreçlerinde kullanılacaktır. Verileriniz üçüncü şahıslarla paylaşılmayacak ve yasal süreler içerisinde imha edilecektir. Onay kutusunu işaretleyerek verilerinizin bu kapsamda işlenmesini kabul etmiş sayılırsınız.`,
      close: 'Kapat'
    },
    en: {
      personalInfo: 'Personal Information',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company Name',
      country: 'Country',
      address: 'Address',
      next: 'Next',
      submit: 'Submit',
      submitting: 'Submitting...',
      successTitle: 'Thank You!',
      successMessage: 'Your survey has been submitted.',
      required: 'Required',
      fillAll: 'Please fill all fields',
      answerRequired: 'Please answer',
      kvkkText: 'I read and approve the Personal Data Protection Law (KVKK) text.',
      kvkkRead: 'Read Text',
      botCheck: 'Security Verification',
      captchaText: 'Please enter the result of the operation:',
      kvkkModalTitle: 'KVKK Clarification Text',
      kvkkLongText: `In accordance with the Law on the Protection of Personal Data No. 6698 ("KVKK"), your personal data is processed by our company as the data controller. Your name, surname, e-mail, telephone and company information collected within the scope of this survey will only be used in corporate research and analysis processes. Your data will not be shared with third parties and will be destroyed within legal periods. By checking the confirmation box, you are deemed to have accepted the processing of your data within this scope.`,
      close: 'Close'
    }
  };
  return dict[lang.value];
});

const handleNext = () => {
  if (step.value === 0) {
    const { fullName, email, phone, companyName, country, address } = customerInfo.value;
    if (!fullName || !email || !phone || !companyName || !country || !address) {
      alert(content.value.fillAll);
      return;
    }
    if (!kvkkAccepted.value || !isCaptchaCorrect.value) {
      alert(lang.value === 'tr' ? 'Lütfen tüm onay kutularını işaretleyiniz ve güvenlik sorusunu doğru yanıtlayınız.' : 'Please check all confirmation boxes and answer the security question correctly.');
      return;
    }
  }
  step.value++;
};

const handleSubmit = async () => {

  // Validate required questions
  for (const q of props.survey.questions) {
    if (q.required) {
      const answer = answers.value[q.id];
      if (!answer || (typeof answer === 'string' && !answer.trim())) {
        alert(`${content.value.answerRequired}: ${lang.value === 'en' ? q.textEN : q.textTR}`);
        return;
      }
    }
  }

  submitting.value = true;
  try {
    await axios.post(`${API_BASE_URL}/api/survey/respond`, {
      surveyId: props.survey.id,
      customerInfo: customerInfo.value,
      language: lang.value,
      answers: answers.value
    });
    step.value = 2;
  } catch (err) {
    alert('Error submitting survey');
    submitting.value = false;
  }
};
</script>

<template>
  <div v-if="step === 2" class="success-panel">
    <h2>{{ content.successTitle }}</h2>
    <p>{{ content.successMessage }}</p>
  </div>

  <div v-else class="form-container">
    <header class="header">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ lang === 'en' ? 'Please complete the survey below' : 'Lütfen aşağıdaki anketi doldurunuz' }}</p>
      <div class="rev-tag" v-if="props.survey.revision">Rev: {{ props.survey.revision }}</div>
    </header>

    <div class="lang-switcher">
      <button @click="lang = 'tr'" :class="{ active: lang === 'tr' }">TR</button>
      <button @click="lang = 'en'" :class="{ active: lang === 'en' }">EN</button>
    </div>

    <form @submit.prevent="step === 0 ? handleNext() : handleSubmit()">
      <!-- Step 0: Personal Info -->
      <div v-if="step === 0" class="fade-in">
        <h2 class="section-title">{{ content.personalInfo }}</h2>
        <div class="input-grid">
          <div class="form-group">
            <label>{{ content.name }}</label>
            <input v-model="customerInfo.fullName" required type="text" />
          </div>
          <div class="form-group">
            <label>{{ content.company }}</label>
            <input v-model="customerInfo.companyName" required type="text" />
          </div>
          <div class="form-group half">
            <label>{{ content.email }}</label>
            <input v-model="customerInfo.email" required type="email" />
          </div>
          <div class="form-group half">
            <label>{{ content.phone }}</label>
            <input v-model="customerInfo.phone" required type="tel" />
          </div>
          <div class="form-group half">
            <label>{{ content.country }}</label>
            <input v-model="customerInfo.country" required type="text" />
          </div>
          <div class="form-group half">
            <label>{{ content.address }}</label>
            <input v-model="customerInfo.address" required type="text" />
          </div>
        </div>

        <!-- Compliance Checks moved here -->
        <div class="compliance-area">
          <label class="check-label">
            <input type="checkbox" v-model="kvkkAccepted" />
            <span>{{ content.kvkkText }}</span>
            <button type="button" @click="showKvkkModal = true" class="link-btn">({{ content.kvkkRead }})</button>
          </label>
          
          <div class="captcha-box">
            <span class="captcha-label">{{ content.botCheck }}</span>
            <div class="captcha-question">
              <span class="math">{{ captchaNum1 }} + {{ captchaNum2 }} = </span>
              <input type="number" v-model="captchaInput" :placeholder="content.captchaText" class="captcha-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Questions -->
      <div v-if="step === 1" class="fade-in">
        <div v-for="q in props.survey.questions" :key="q.id" class="question-card">
          <p class="question-text">
            {{ lang === 'en' ? q.textEN : q.textTR }}
            <span v-if="q.required" class="required-star">*</span>
            <span v-else class="optional-tag">({{ lang === 'en' ? 'Optional' : 'İsteğe bağlı' }})</span>
          </p>
          <p v-if="lang === 'tr' ? q.descriptionTR : q.descriptionEN" class="question-desc">
            {{ lang === 'tr' ? q.descriptionTR : q.descriptionEN }}
          </p>

          <div class="answer-area">
            <!-- Rate Type -->
            <div v-if="q.type === 'RATE'" class="rate-area">
              <div class="rate-buttons">
                <button v-for="val in 5" :key="val" type="button" 
                  :class="{ active: answers[q.id] === val.toString() }"
                  @click="answers[q.id] = val.toString()">
                  {{ val }}
                </button>
              </div>
              <div class="rate-labels">
                <span>{{ lang === 'en' ? 'Lowest' : 'En Düşük' }}</span>
                <span>{{ lang === 'en' ? 'Highest' : 'En Yüksek' }}</span>
              </div>
            </div>

            <!-- Choice Type -->
            <div v-if="q.type === 'CHOICE'" class="choice-area">
              <label v-for="opt in q.options" :key="opt.id" class="choice-label">
                <input type="radio" :name="q.id" 
                  :value="lang === 'en' ? opt.textEN : opt.textTR"
                  v-model="answers[q.id]" />
                <span>{{ lang === 'en' ? opt.textEN : opt.textTR }}</span>
              </label>
            </div>

            <!-- Text Type -->
            <textarea v-if="q.type === 'TEXT'" v-model="answers[q.id]" rows="3" class="text-area"></textarea>

            <!-- Yes/No Type -->
            <div v-if="q.type === 'YES_NO'" class="yes-no-area">
              <button type="button" :class="{ active: answers[q.id] === 'Yes' }" @click="answers[q.id] = 'Yes'">
                {{ lang === 'en' ? 'Yes' : 'Evet' }}
              </button>
              <button type="button" :class="{ active: answers[q.id] === 'No' }" @click="answers[q.id] = 'No'">
                {{ lang === 'en' ? 'No' : 'Hayır' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="submit" :disabled="submitting || (step === 0 && (!kvkkAccepted || !isCaptchaCorrect))" class="submit-btn" :class="{ disabled: step === 0 && (!kvkkAccepted || !isCaptchaCorrect) }">
          {{ submitting ? content.submitting : (step === 0 ? content.next : content.submit) }}
        </button>
      </div>
    </form>
  </div>

  <!-- KVKK Modal -->
  <div v-if="showKvkkModal" class="kvkk-overlay" @click="showKvkkModal = false">
    <div class="kvkk-modal" @click.stop>
      <header>
        <h3>{{ content.kvkkModalTitle }}</h3>
        <button @click="showKvkkModal = false" class="close-x">&times;</button>
      </header>
      <div class="kvkk-body">
        {{ content.kvkkLongText }}
      </div>
      <footer>
        <button @click="showKvkkModal = false" class="btn-close">{{ content.close }}</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.success-panel {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.success-panel h2 {
  color: #6366f1;
  margin-bottom: 1rem;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #64748b;
}

.rev-tag {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.lang-switcher {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.lang-switcher button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
}

.lang-switcher button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.input-grid {
  display: grid;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.form-group.half {
  grid-column: span 1;
}

@media (min-width: 640px) {
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.question-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.question-text {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.required-star {
  color: #ef4444;
  margin-left: 0.25rem;
}

.optional-tag {
  color: #64748b;
  font-weight: 400;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.question-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.rate-buttons {
  display: flex;
  gap: 0.5rem;
}

.rate-buttons button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

.rate-buttons button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.rate-labels {
  display: flex;
  justify-content: space-between;
  max-width: 15rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.choice-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.text-area {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  font-family: inherit;
}

.yes-no-area {
  display: flex;
  gap: 1rem;
}

.yes-no-area button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 600;
  cursor: pointer;
}

.yes-no-area button.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.compliance-area {
  margin-bottom: 1.5rem;
  text-align: left;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  border-radius: 1rem;
  background: #f8fafc;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.check-label:last-child {
  margin-bottom: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  text-decoration: underline;
}

.captcha-box {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}

.captcha-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.captcha-question {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.captcha-question .math {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  background: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.captcha-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.captcha-input:focus {
  outline: none;
  border-color: #6366f1;
}

.actions {
  margin-top: 2rem;
  text-align: right;
}

.submit-btn {
  padding: 1rem 2.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(.disabled) {
  background: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.submit-btn.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}

/* KVKK Modal */
.kvkk-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center; justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.kvkk-modal {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.kvkk-modal header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kvkk-modal h3 {
  margin: 0;
  color: #1e293b;
}

.close-x {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;
}

.kvkk-body {
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #475569;
}

.kvkk-modal footer {
  padding: 1.25rem;
  border-top: 1px solid #f1f5f9;
  text-align: right;
}

.btn-close {
  padding: 0.6rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
