# 🚀 دليل البدء السريع
# Quick Start Guide

## خطوات سريعة للبدء (5 دقائق)

### 1️⃣ تثبيت المكتبات

```bash
npm install --legacy-peer-deps
```

### 2️⃣ إعداد قاعدة البيانات MySQL

```bash
# افتح MySQL
mysql -u root -p

# في MySQL console:
CREATE DATABASE tafseer_elahlam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3️⃣ إعداد ملف .env

أنشئ ملف `.env` في جذر المشروع:

```env
# Database - عدّل username و password
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/tafseer_elahlam"

# JWT Secret - استخدم مفتاح قوي
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

💡 **لتوليد JWT_SECRET قوي:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ إنشاء قاعدة البيانات

```bash
# توليد Prisma Client
npx prisma generate

# إنشاء الجداول في قاعدة البيانات
npx prisma db push

# إضافة بيانات تجريبية
npm run prisma:seed
```

### 5️⃣ تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح: **http://localhost:3000**

---

## 🎯 الحسابات التجريبية

بعد تشغيل `npm run prisma:seed`:

### 👤 حساب المدير (Admin)
```
Email: admin@mubasharat.com
Password: admin123
```

### 🔮 حساب المفسر (Interpreter)
```
Email: interpreter@mubasharat.com
Password: interpreter123
```

### 👁️ حساب الرائي (Dreamer)
```
Email: dreamer@mubasharat.com
Password: dreamer123
```

⚠️ **تحذير**: غيّر كلمات المرور في الإنتاج!

---

## 🔧 استكشاف المشاكل

### ❌ خطأ: "Cannot connect to database"

**الحل:**
```bash
# تحقق من تشغيل MySQL
# Windows:
net start mysql

# Mac/Linux:
sudo service mysql status

# تحقق من صحة DATABASE_URL في ملف .env
```

### ❌ خطأ: "Prisma Client not found"

**الحل:**
```bash
npx prisma generate
```

### ❌ خطأ: "Table doesn't exist"

**الحل:**
```bash
# أعد إنشاء الجداول
npx prisma db push --force-reset
npm run prisma:seed
```

### ❌ مشكلة تسجيل الدخول لا يعمل

**الحل:**
```bash
# 1. تحقق من وجود البيانات
npx prisma studio
# افتح http://localhost:5555 وتحقق من جدول users

# 2. أعد تشغيل seed
npm run prisma:seed

# 3. تحقق من console في المتصفح (F12)
# ابحث عن أي أخطاء
```

---

## 📊 أوامر مفيدة

```bash
# عرض قاعدة البيانات (واجهة رسومية)
npx prisma studio

# إعادة إنشاء قاعدة البيانات
npx prisma db push --force-reset
npm run prisma:seed

# تشغيل التطبيق
npm run dev

# Build للإنتاج
npm run build
npm start
```

---

## ✅ التحقق من الإعداد

### الخطوة 1: تحقق من قاعدة البيانات

```bash
mysql -u root -p -e "USE tafseer_elahlam; SHOW TABLES;"
```

يجب أن ترى:
- users
- profiles
- dreams
- messages
- comments
- plans
- user_plans
- requests
- chat_messages
- admin_logs

### الخطوة 2: تحقق من البيانات

```bash
mysql -u root -p -e "USE tafseer_elahlam; SELECT email, role FROM profiles;"
```

يجب أن ترى الحسابات التجريبية الثلاثة.

### الخطوة 3: اختبر تسجيل الدخول

1. افتح http://localhost:3000/auth/login
2. استخدم: admin@mubasharat.com / admin123
3. يجب أن تُوجَّه إلى /dashboard

---

## 🎓 الخطوات التالية

1. ✅ اقرأ [README.md](./README.md) للتوثيق الكامل
2. ✅ استكشف [Prisma Studio](http://localhost:5555) لعرض البيانات
3. ✅ جرّب تسجيل حساب جديد
4. ✅ اختبر إنشاء رؤية جديدة
5. ✅ ابدأ التطوير! 🚀

---

## 📚 روابط مفيدة

- [التوثيق الكامل](./README.md)
- [دليل الإعداد المفصل](./SETUP.md)
- [دليل الهجرة من Supabase](./MIGRATION_GUIDE.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🆘 الدعم

واجهت مشكلة؟
1. تحقق من [استكشاف المشاكل](#-استكشاف-المشاكل) أعلاه
2. افتح console المتصفح (F12) وابحث عن أخطاء
3. تحقق من terminal الخاص بك من أخطاء الخادم
4. راجع [README.md](./README.md) للمزيد من التفاصيل

---

**استمتع بالتطوير! Happy Coding! 🎉**

