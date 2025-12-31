# 🔧 إصلاح مشكلة تسجيل الدخول
# Fixing Login Issue

## المشكلة (The Problem)

عند تسجيل الدخول، تبقى في صفحة تسجيل الدخول بدلاً من الانتقال إلى لوحة التحكم.

When logging in, you stay on the login page instead of being redirected to the dashboard.

---

## الأسباب المحتملة (Possible Causes)

1. ❌ قاعدة البيانات غير مهيأة
2. ❌ Prisma Client غير مُحدّث
3. ❌ Cookies لا يتم تعيينها بشكل صحيح
4. ❌ لا توجد بيانات مستخدمين في قاعدة البيانات

---

## ✅ الحل خطوة بخطوة (Step-by-Step Solution)

### الخطوة 1: أوقف جميع الخوادم

```bash
# اضغط Ctrl+C في terminal حيث يعمل npm run dev
# تأكد من إغلاق جميع نوافذ terminal
```

### الخطوة 2: تحقق من الإعداد

```bash
# شغّل سكربت الفحص
node check-setup.js
```

### الخطوة 3: أنشئ ملف .env إذا لم يكن موجوداً

أنشئ ملف `.env` في جذر المشروع:

```env
# استبدل username و password بقيمك الفعلية
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/tafseer_elahlam"

# استخدم مفتاح قوي (32 حرف أو أكثر)
JWT_SECRET="change-this-to-a-secure-random-string-min-32-chars"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

💡 **لتوليد JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### الخطوة 4: تأكد من تشغيل MySQL

```bash
# Windows
net start mysql

# Mac/Linux
sudo service mysql start

# أو
sudo systemctl start mysql
```

### الخطوة 5: أنشئ قاعدة البيانات

```bash
# افتح MySQL
mysql -u root -p

# في MySQL console:
CREATE DATABASE IF NOT EXISTS tafseer_elahlam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;  # يجب أن ترى tafseer_elahlam
EXIT;
```

### الخطوة 6: احذف مجلد .prisma القديم

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules\.prisma

# أو Mac/Linux
rm -rf node_modules/.prisma
```

### الخطوة 7: أعد توليد Prisma Client

```bash
npx prisma generate
```

إذا واجهت خطأ `EPERM`، جرّب:

**Windows:**
```powershell
# افتح PowerShell كمسؤول
taskkill /F /IM node.exe
npx prisma generate
```

**أو أعد تشغيل الكمبيوتر وجرّب مرة أخرى**

### الخطوة 8: أنشئ الجداول في قاعدة البيانات

```bash
npx prisma db push
```

يجب أن ترى رسالة تأكيد مثل:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

### الخطوة 9: أضف البيانات التجريبية

```bash
npm run prisma:seed
```

يجب أن ترى:
```
✅ Created plan: مجاني
✅ Created plan: أساسي
✅ Created admin user: admin@mubasharat.com
✅ Created interpreter: interpreter@mubasharat.com
✅ Created dreamer: dreamer@mubasharat.com
```

### الخطوة 10: تحقق من البيانات

```bash
# افتح Prisma Studio
npx prisma studio
```

افتح المتصفح على http://localhost:5555:
- تحقق من وجود بيانات في جدول `users`
- تحقق من وجود بيانات في جدول `profiles`
- يجب أن ترى 3 مستخدمين

### الخطوة 11: شغّل التطبيق

```bash
npm run dev
```

### الخطوة 12: اختبر تسجيل الدخول

1. افتح المتصفح: http://localhost:3000/auth/login
2. افتح Developer Tools (اضغط F12)
3. اذهب إلى **Console** tab
4. سجّل الدخول باستخدام:
   ```
   Email: admin@mubasharat.com
   Password: admin123
   ```
5. راقب الـ console:
   - يجب أن ترى: `[Auth] Attempting login with: admin@mubasharat.com`
   - ثم: `[API] Login attempt for: admin@mubasharat.com`
   - ثم: `[API] Login successful for: admin@mubasharat.com`
   - ثم: `[Auth] Login successful: [user-id]`
   
6. يجب أن يتم توجيهك إلى `/dashboard`

---

## 🔍 إذا ظلت المشكلة موجودة (If Problem Persists)

### تحقق من الـ Console في المتصفح

افتح F12 → Console وابحث عن أخطاء. الأخطاء الشائعة:

#### خطأ 1: "Failed to fetch" أو "Network Error"
```
السبب: الخادم لا يعمل أو port مختلف
الحل: تأكد من تشغيل npm run dev على port 3000
```

#### خطأ 2: "Invalid email or password"
```
السبب: لا توجد بيانات في قاعدة البيانات
الحل: أعد تشغيل npm run prisma:seed
```

#### خطأ 3: "PrismaClientInitializationError"
```
السبب: لا يمكن الاتصال بقاعدة البيانات
الحل: تحقق من DATABASE_URL في .env
      تأكد من تشغيل MySQL
```

### تحقق من الـ Terminal (Server Logs)

ابحث في terminal حيث يعمل `npm run dev`:

#### خطأ: "Can't reach database server"
```
الحل:
1. تأكد من تشغيل MySQL: net start mysql (Windows)
2. تحقق من DATABASE_URL في .env
3. تحقق من أن username و password صحيحين
```

#### خطأ: "Table 'tafseer_elahlam.users' doesn't exist"
```
الحل:
npx prisma db push
```

### اختبار الاتصال بقاعدة البيانات يدوياً

```bash
mysql -u root -p

USE tafseer_elahlam;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT email FROM profiles;
```

يجب أن ترى 3 emails (admin, interpreter, dreamer).

---

## 🎯 الحل السريع (Quick Fix)

إذا كنت مستعجلاً، نفّذ هذه الأوامر بالترتيب:

```bash
# 1. أوقف الخادم (Ctrl+C)

# 2. نظّف وأعد التثبيت
Remove-Item -Recurse -Force node_modules\.prisma

# 3. أعد توليد Prisma
npx prisma generate

# 4. أعد إنشاء قاعدة البيانات
npx prisma db push --force-reset

# 5. أضف البيانات
npm run prisma:seed

# 6. شغّل التطبيق
npm run dev
```

---

## 📞 الدعم

إذا ظلت المشكلة:

1. ✅ تحقق من جميع الخطوات أعلاه
2. ✅ راجع QUICK_START.md
3. ✅ افتح issue في GitHub مع:
   - Screenshot من console في المتصفح (F12)
   - Logs من terminal
   - محتوى ملف .env (بدون passwords!)

---

**نصيحة مهمة**: بعد كل تغيير في schema.prisma، يجب تشغيل:
```bash
npx prisma generate
npx prisma db push
```

**Good luck! حظ سعيد! 🚀**

