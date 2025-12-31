# دليل الإعداد السريع
# Quick Setup Guide

هذا دليل سريع لإعداد مشروع مبشرات من الصفر.

This is a quick guide to set up the Mubasharat project from scratch.

---

## المتطلبات (Prerequisites)

- ✅ Node.js 18 أو أحدث
- ✅ PostgreSQL 14 أو أحدث
- ✅ npm أو pnpm
- ✅ Git

---

## الإعداد السريع (Quick Setup)

### 1. استنساخ المشروع (Clone the Project)

```bash
git clone <repository-url>
cd moeshrat
```

### 2. تثبيت الحزم (Install Dependencies)

```bash
npm install --legacy-peer-deps
```

### 3. إنشاء قاعدة البيانات (Create Database)

```bash
# باستخدام PostgreSQL CLI
psql -U postgres

# ثم في PostgreSQL shell
CREATE DATABASE tafseer_elahlam;
\q
```

أو باستخدام command واحد:
```bash
createdb tafseer_elahlam
```

### 4. تكوين متغيرات البيئة (Configure Environment)

أنشئ ملف `.env` في جذر المشروع:

```bash
cp .env.example .env
```

ثم عدّل `.env`:

```env
# Database - عدّل اسم المستخدم وكلمة المرور
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tafseer_elahlam?schema=public"

# JWT Secret - استخدم مفتاح قوي
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

💡 **نصيحة**: لتوليد JWT secret قوي:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. إعداد Prisma (Setup Prisma)

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق Schema على قاعدة البيانات
npx prisma db push

# إضافة بيانات أولية (اختياري)
npm run prisma:seed
```

### 6. تشغيل المشروع (Run the Project)

```bash
npm run dev
```

افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

---

## الحسابات التجريبية (Test Accounts)

بعد تشغيل seed script، يمكنك استخدام:

### مدير النظام (Admin)
- **البريد**: admin@mubasharat.com
- **كلمة المرور**: admin123

### مفسر (Interpreter)
- **البريد**: interpreter@mubasharat.com
- **كلمة المرور**: interpreter123

### رائي (Dreamer)
- **البريد**: dreamer@mubasharat.com
- **كلمة المرور**: dreamer123

⚠️ **مهم**: غيّر هذه كلمات المرور في بيئة الإنتاج!

---

## أوامر مفيدة (Useful Commands)

### Prisma

```bash
# فتح Prisma Studio (واجهة ويب لعرض البيانات)
npm run prisma:studio

# إعادة توليد Prisma Client بعد تعديل Schema
npm run prisma:generate

# تطبيق تغييرات Schema
npm run prisma:push

# إعادة تشغيل seed
npm run prisma:seed
```

### Development

```bash
# تشغيل الخادم المحلي
npm run dev

# Build للإنتاج
npm run build

# تشغيل build الإنتاج
npm start

# فحص الأكواد
npm run lint
```

---

## التحقق من الإعداد (Verify Setup)

### 1. تحقق من قاعدة البيانات

```bash
psql -U postgres -d tafseer_elahlam -c "\dt"
```

يجب أن ترى قائمة بالجداول مثل:
- users
- profiles
- dreams
- messages
- plans
- etc.

### 2. تحقق من Prisma Client

```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(count => console.log('Users:', count))"
```

### 3. اختبر تسجيل الدخول

1. افتح [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. استخدم أحد الحسابات التجريبية
3. يجب أن يتم توجيهك إلى لوحة التحكم

---

## استكشاف المشاكل (Troubleshooting)

### مشكلة: "Cannot connect to database"

**الحل**:
1. تأكد من تشغيل PostgreSQL:
   ```bash
   # Mac/Linux
   sudo service postgresql status
   
   # Windows
   pg_ctl status
   ```

2. تحقق من بيانات الاتصال في `.env`
3. تأكد من وجود قاعدة البيانات:
   ```bash
   psql -U postgres -l | grep tafseer_elahlam
   ```

### مشكلة: "Prisma Client not found"

**الحل**:
```bash
npx prisma generate
```

### مشكلة: "JWT verification failed"

**الحل**:
1. امسح cookies المتصفح
2. سجل الدخول مجدداً
3. تأكد من أن JWT_SECRET موجود في `.env`

### مشكلة: "Port 3000 already in use"

**الحل**:
```bash
# استخدم port مختلف
PORT=3001 npm run dev

# أو اقتل العملية على port 3000
# Mac/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## الخطوات التالية (Next Steps)

1. ✅ استكشف [Prisma Studio](http://localhost:5555)
   ```bash
   npm run prisma:studio
   ```

2. ✅ اقرأ [README.md](./README.md) للمزيد من التفاصيل

3. ✅ راجع [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) إذا كنت تهاجر من Supabase

4. ✅ اطّلع على [API Documentation](./README.md#api-documentation)

5. ✅ ابدأ التطوير! 🚀

---

## الدعم (Support)

إذا واجهت أي مشاكل:

1. راجع [استكشاف المشاكل](#استكشاف-المشاكل-troubleshooting)
2. تحقق من [README.md](./README.md)
3. افتح issue في GitHub
4. تواصل مع الفريق

---

**نصائح للإنتاج (Production Tips)**:

- 🔒 استخدم JWT_SECRET قوي وعشوائي
- 🔒 غيّر جميع كلمات المرور التجريبية
- 🔒 فعّل HTTPS
- 🔒 استخدم متغيرات البيئة للأسرار
- 📊 راقب أداء قاعدة البيانات
- 💾 اعمل backup منتظم للبيانات
- 🚀 استخدم CDN للملفات الثابتة

---

**استمتع بالتطوير! Happy coding! 🎉**

