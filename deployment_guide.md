# cPanel Deployment Guide

Bu rehber, anket sisteminizi cPanel tabanlı bir hosting hizmetine nasıl yükleyeceğinizi adım adım açıklar.

## 1. Hazırlık (Kendi Bilgisayarınızda)

### A. Frontend (Ön Yüz)
1. `client/src/config.ts` dosyasını açın.
2. `API_BASE_URL` değişkeninin sunucunuzdaki API adresine baktığından emin olun.
3. `client` klasöründe terminal açın ve şu komutu çalıştırın:
   ```bash
   npm run build
   ```
4. `client/dist` klasörü oluşacaktır. Bu klasörün içindeki her şeyi sunucuya yüklemek üzere hazırda tutun.

### B. Backend (Sunucu Tarafı)
1. `server` klasöründe terminal açın ve şu komutu çalıştırın:
   ```bash
   npm run build
   ```
2. Bu işlem `server/dist` klasörünü oluşturacaktır. Sunucuya yüklerken bu klasörü ve `package.json`, `prisma` klasörü ile `.env` dosyasını almanız yeterlidir. `src` klasörüne gerek yoktur.

---

## 2. Sunucuya Yükleme (cPanel)

### A. Frontend Yüklemesi
1. cPanel Dosya Yöneticisi'ne (File Manager) girin.
2. `public_html` klasörüne (veya anketin çalışmasını istediğiniz alt klasöre) gidin.
3. Kendi bilgisayarınızdaki `client/dist` içindeki **tüm dosyaları** buraya yükleyin.

### B. Backend Yüklemesi
1. Sunucunuzda Node.js uygulamalarını barındırmak için bir klasör oluşturun (Örn: `/home/user/anket-api`).
2. Kendi bilgisayarınızdaki `server` klasöründen şu dosyaları yükleyin:
   - `dist/` (Klasör olarak)
   - `prisma/` (Klasör olarak)
   - `package.json`
   - `.env`
3. `server/.env` dosyasını sunucuda güncelleyin:
   ```env
   PORT=3001
   DATABASE_URL="file:./prisma/dev.db"
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=sifreniz
   ```

---

## 3. Node.js Uygulamasını Başlatma (Build Yöntemi)

1. cPanel'de **"Setup Node.js App"** simgesine tıklayın.
2. **"Create Application"** butonuna basın.
3. Ayarları şu şekilde yapın:
   - **Node.js version:** En az 18 veya 20 seçin (22 de uygundur).
   - **Application mode:** Production
   - **Application root:** `anket-api` (Yüklediğiniz backend klasörü)
   - **Application URL:** `api`
   - **Application startup file:** `dist/index.js`
4. **"Create"** dedikten sonra **"Run npm install"** butonuna basın.
5. Veritabanını hazırlamak için terminal (SSH) üzerinden şu komutları çalıştırın (backend klasöründe):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. Son olarak **"Start Application"** butonuna basarak uygulamayı başlatın.

---

## 4. Kritik Kontroller
- **SSL:** Sitenizin HTTPS üzerinden çalıştığından emin olun.
- **SPA Routing (404 Hatası):** Sayfa yenilendiğinde veya doğrudan linke gidildiğinde 404 alıyorsanız, `public_html` içine `.htaccess` dosyası ekleyin (aşağıya bakın).

### 5. SPA Yönlendirme Fix (.htaccess)
cPanel (Apache) sunucularda Vue.js gibi SPA uygulamalarının yönlendirmelerinin çalışması için `public_html` klasöründe şu içeriğe sahip bir `.htaccess` dosyası olmalıdır:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Uygulamanız artık yayında olmalıdır!
