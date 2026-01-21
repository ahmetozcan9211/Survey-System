# 📊 Enterprise Survey & Feedback Platform 2026

Modern, güvenli ve kurumsal ihtiyaçlara yönelik olarak tasarlanmış, çok dilli (TR/EN) gelişmiş bir anket ve geri bildirim sistemidir.

## ✨ Öne Çıkan Özellikler

- **Kurumsal Portal Tasarımı:** Estetik ve profesyonel bir ana sayfa ile anketlere kolay erişim.
- **Dinamik Anket Editörü:** Sorular, seçenekler ve farklı soru tipleriyle (Seçenekli, Puanlama, Metin) anket oluşturma.
- **Akıllı Çeviri Sistemi:** Anket sorularını tek tıkla otomatik olarak dile (TR <-> EN) çevirme imkanı.
- **Gelişmiş Bot Koruması:** Matematiksel CAPTCHA doğrulama sistemi.
- **KVKK Uyumluluğu:** Entegre KVKK onay metni ve modal desteği.
- **Profesyonel PDF Çıktıları:**
    - Tüm yanıtları içeren toplu tablo çıktısı.
    - Her bir yanıt için detaylı bireysel PDF formu.
    - Tam Türkçe karakter desteği.
- **Yönetici Paneli:** Yanıt takibi, anket yönetimi ve detaylı istatistikler.

## 🚀 Teknoloji Yığını

### Ön Yüz (Frontend)
- **Vue 3** (Composition API)
- **Vite** (Hızlı derleme ve geliştirme)
- **Vue Router** (Sayfa yönetimi)
- **Axios** (API iletişimi)
- **Lucide Vue Next** (Simge seti)
- **jsPDF & AutoTable** (PDF oluşturma)

### Arka Yüz (Backend)
- **Node.js & Express**
- **Prisma** (ORM - SQLite Veritabanı)
- **Zod** (Veri doğrulama)
- **Rate Limiter** (Güvenlik ve hız sınırlama)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi
```

### 2. Bağımlılıkları Yükleyin
```bash
# Backend için
cd server
npm install

# Frontend için
cd ../client
npm install
```

### 3. Veritabanını Hazırlayın
```bash
cd ../server
npx prisma db push
```

### 4. Geliştirme Modunda Çalıştırın
```bash
# Server klasöründe
npm run dev

# Client klasöründe
npm run dev
```

## 🌐 Yayına Alım (Deployment)

Proje cPanel ve standart Node.js sunucularıyla tam uyumludur. Detaylı kurulum adımları için `deployment_guide.md` dosyasını inceleyebilirsiniz.

## 📝 Lisans

Bu proje MIT lisansı ile korunmaktadır.
