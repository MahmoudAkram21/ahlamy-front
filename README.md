# مبشرات (Mubasharat) - منصة تفسير الرؤى والأحلام

## نظرة عامة

مبشرات هي منصة متخصصة لتفسير الرؤى والأحلام، تربط بين الرائين (أصحاب الرؤى) والمفسرين المعتمدين. المنصة مبنية باستخدام Next.js 15، Prisma، وPostgreSQL.

## المميزات الرئيسية

- **نظام مصادقة آمن**: استخدام JWT للمصادقة وإدارة الجلسات
- **إدارة الرؤى**: إنشاء ومشاركة الرؤى مع المفسرين
- **نظام الرسائل**: التواصل المباشر بين الرائين والمفسرين
- **إدارة الخطط**: نظام اشتراكات مرن مع خطط متعددة
- **لوحة تحكم إدارية**: إدارة شاملة للمستخدمين والرؤى والطلبات
- **واجهة عربية**: دعم كامل للغة العربية مع تصميم RTL

## البنية التقنية

### التقنيات المستخدمة

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (tafseer_elahlam)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form, Zod

### هيكل المشروع

```
moeshrat/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # المصادقة (login, register, logout, me)
│   │   ├── dreams/          # إدارة الرؤى
│   │   ├── messages/        # الرسائل
│   │   ├── comments/        # التعليقات
│   │   ├── requests/        # طلبات التفسير
│   │   └── notifications/   # الإشعارات
│   ├── auth/                # صفحات المصادقة
│   ├── dashboard/           # لوحة التحكم
│   ├── dreams/              # صفحات الرؤى
│   ├── admin/               # لوحة الإدارة
│   └── interpreter/         # صفحات المفسرين
├── components/              # مكونات React
├── lib/                     # المكتبات والأدوات المساعدة
│   ├── prisma.ts           # Prisma Client
│   ├── auth.ts             # أدوات المصادقة
│   ├── session.ts          # إدارة الجلسات
│   └── auth-client.ts      # مصادقة العميل
├── prisma/                  # Prisma Schema
│   └── schema.prisma       # نموذج قاعدة البيانات
└── scripts/                 # SQL scripts للإعداد

```

## الإعداد والتثبيت

### المتطلبات المسبقة

- Node.js 18+ و npm/pnpm
- MySQL 8.0+ (or MariaDB 10.5+)
- Git

### خطوات التثبيت

#### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd moeshrat
```

#### 2. تثبيت الحزم

```bash
npm install --legacy-peer-deps
# أو
pnpm install
```

#### 3. إعداد قاعدة البيانات

أولاً، قم بإنشاء قاعدة بيانات MySQL:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE tafseer_elahlam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user (optional but recommended)
CREATE USER 'tafseer_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tafseer_elahlam.* TO 'tafseer_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### 4. تكوين متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/tafseer_elahlam"
# Example: DATABASE_URL="mysql://tafseer_user:your_secure_password@localhost:3306/tafseer_elahlam"

# JWT Secret (استخدم مفتاح قوي وعشوائي للإنتاج)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

⚠️ **مهم**: في بيئة الإنتاج، استخدم مفتاح JWT قوي وفريد. يمكنك توليد واحد باستخدام:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. إعداد قاعدة البيانات باستخدام Prisma

```bash
# توليد Prisma Client
npx prisma generate

# تشغيل الترحيلات (migrations)
npx prisma db push

# (اختياري) فتح Prisma Studio لعرض البيانات
npx prisma studio
```

#### 6. إضافة بيانات تجريبية (اختياري)

```bash
# يمكنك استخدام السكربتات في مجلد scripts/ لإضافة بيانات تجريبية
```

#### 7. تشغيل التطبيق

```bash
npm run dev
# أو
pnpm dev
```

التطبيق سيعمل على [http://localhost:3000](http://localhost:3000)

## البنية والمعمارية

### نموذج قاعدة البيانات (Prisma Schema)

#### الجداول الرئيسية:

1. **users**: بيانات المصادقة الأساسية
2. **profiles**: معلومات المستخدمين التفصيلية
3. **dreams**: الرؤى والأحلام
4. **messages**: رسائل التواصل
5. **comments**: التعليقات على الرؤى
6. **plans**: خطط الاشتراكات
7. **user_plans**: اشتراكات المستخدمين
8. **requests**: طلبات التفسير
9. **chat_messages**: رسائل الدردشة
10. **admin_logs**: سجلات الإدارة

### نظام الأدوار (Roles)

- **dreamer**: رائي (صاحب رؤية)
- **interpreter**: مفسر أحلام
- **admin**: مدير النظام

### نظام المصادقة

#### تسجيل الدخول:

1. المستخدم يرسل بيانات الدخول إلى `/api/auth/login`
2. يتم التحقق من البريد الإلكتروني وكلمة المرور
3. يتم توليد JWT token
4. يتم حفظ التوكن في cookie آمن
5. يتم إرجاع بيانات المستخدم

#### التسجيل:

1. المستخدم يرسل بيانات التسجيل إلى `/api/auth/register`
2. يتم تشفير كلمة المرور باستخدام bcrypt
3. يتم إنشاء المستخدم والملف الشخصي في transaction
4. يتم توليد JWT token وحفظه
5. يتم إرجاع بيانات المستخدم

#### التحقق من الجلسة:

- يتم التحقق من JWT token في كل طلب API
- الـ Middleware يحمي المسارات المحمية
- يتم التحقق من الصلاحيات حسب الدور

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
إنشاء حساب جديد

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "أحمد محمد",
  "role": "dreamer"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "dreamer"
  },
  "profile": { ... }
}
```

#### POST `/api/auth/login`
تسجيل الدخول

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "profile": { ... }
}
```

#### POST `/api/auth/logout`
تسجيل الخروج

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`
الحصول على بيانات المستخدم الحالي

**Response (200):**
```json
{
  "user": { ... },
  "profile": { ... }
}
```

### Dreams Endpoints

#### GET `/api/dreams`
الحصول على الرؤى (مفلترة حسب دور المستخدم)

#### POST `/api/dreams`
إنشاء رؤية جديدة

**Request Body:**
```json
{
  "title": "رؤية الماء الصافي",
  "content": "رأيت نفسي...",
  "dream_date": "2024-01-15",
  "mood": "peaceful"
}
```

#### GET `/api/dreams/[id]`
الحصول على رؤية محددة

#### PATCH `/api/dreams/[id]`
تحديث رؤية

#### DELETE `/api/dreams/[id]`
حذف رؤية

### Messages & Comments

#### GET `/api/messages?dream_id={id}`
الحصول على رسائل رؤية معينة

#### POST `/api/messages`
إرسال رسالة جديدة

#### GET `/api/comments?dream_id={id}`
الحصول على تعليقات رؤية

#### POST `/api/comments`
إضافة تعليق

### Requests

#### GET `/api/requests`
الحصول على طلبات المستخدم

#### POST `/api/requests`
إنشاء طلب تفسير جديد

## المكونات الرئيسية (Components)

### UI Components

تقع في `components/ui/`:
- `button.tsx`: أزرار
- `card.tsx`: بطاقات
- `input.tsx`: حقول الإدخال
- `select.tsx`: قوائم منسدلة
- `spinner.tsx`: مؤشر التحميل
- `badge.tsx`: شارات
- `textarea.tsx`: حقول نصية كبيرة

### Feature Components

- `bottom-navigation.tsx`: شريط التنقل السفلي
- `dashboard-header.tsx`: رأس لوحة التحكم
- `dream-content-card.tsx`: بطاقة عرض الرؤية
- `chat-message.tsx`: رسالة دردشة
- `plan-card.tsx`: بطاقة خطة الاشتراك

## الأمان (Security)

### إجراءات الأمان المطبقة:

1. **تشفير كلمات المرور**: استخدام bcrypt مع salt rounds = 10
2. **JWT Tokens**: توقيع آمن مع انتهاء صلاحية (7 أيام)
3. **HTTP-Only Cookies**: تخزين التوكنات في cookies آمنة
4. **Secure Cookies**: في الإنتاج، يتم استخدام secure flag
5. **Input Validation**: التحقق من المدخلات في API routes
6. **Authorization Checks**: التحقق من الصلاحيات في كل عملية

### توصيات الأمان:

- استخدم HTTPS في الإنتاج
- غيّر JWT_SECRET إلى قيمة قوية وعشوائية
- فعّل rate limiting على API routes
- استخدم environment variables لجميع الأسرار
- راجع الأكواد بانتظام بحثاً عن ثغرات

## النشر (Deployment)

### Vercel Deployment

1. ربط المشروع بـ Vercel
2. إضافة متغيرات البيئة في لوحة تحكم Vercel
3. ربط قاعدة بيانات PostgreSQL (مثل Neon, Supabase Database, أو Railway)
4. تشغيل `npx prisma generate && npx prisma db push` في build command

### متغيرات البيئة المطلوبة للإنتاج:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## الصيانة والتطوير

### إضافة جدول جديد:

1. عدّل `prisma/schema.prisma`
2. نفّذ `npx prisma generate`
3. نفّذ `npx prisma db push`
4. أنشئ API routes المناسبة

### تحديث نموذج موجود:

1. عدّل `prisma/schema.prisma`
2. نفّذ `npx prisma generate`
3. نفّذ `npx prisma db push` (أو استخدم migrations في الإنتاج)

### استخدام Prisma Studio:

```bash
npx prisma studio
```

يفتح واجهة ويب على `http://localhost:5555` لعرض وتعديل البيانات

## استكشاف الأخطاء (Troubleshooting)

### مشكلة: "Invalid connection string"

**الحل**: تحقق من صحة DATABASE_URL في ملف .env

### مشكلة: "JWT verification failed"

**الحل**: تأكد من أن JWT_SECRET متطابق بين الطلبات، أو سجل الدخول مجدداً

### مشكلة: "Prisma Client not found"

**الحل**: نفّذ `npx prisma generate`

### مشكلة: "Cannot connect to database"

**الحل**: 
- تأكد من تشغيل PostgreSQL
- تحقق من بيانات الاتصال
- تأكد من وجود قاعدة البيانات

## المساهمة (Contributing)

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

## الترخيص

[أضف معلومات الترخيص هنا]

## الدعم والتواصل

للأسئلة والدعم، يرجى فتح issue في GitHub أو التواصل عبر [معلومات التواصل]

---

**ملاحظة**: هذا المشروع انتقل من Supabase إلى Prisma لتوفير مرونة أكبر وتحكم أفضل في قاعدة البيانات.
