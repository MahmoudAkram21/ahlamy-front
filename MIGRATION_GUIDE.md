# دليل الهجرة من Supabase إلى Prisma
# Migration Guide: Supabase to Prisma

## نظرة عامة (Overview)

هذا الدليل يوضح كيفية الانتقال من Supabase إلى Prisma مع قاعدة بيانات PostgreSQL مخصصة.

This guide explains how to migrate from Supabase to Prisma with a custom PostgreSQL database.

---

## التغييرات الرئيسية (Major Changes)

### 1. قاعدة البيانات (Database)

**قبل (Before):**
- Supabase Hosted PostgreSQL
- استخدام Supabase Auth لإدارة المستخدمين

**بعد (After):**
- PostgreSQL مخصص (اسم القاعدة: `tafseer_elahlam`)
- Prisma ORM لإدارة قاعدة البيانات
- نظام مصادقة مخصص باستخدام JWT

### 2. المصادقة (Authentication)

**قبل (Before):**
```typescript
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

**بعد (After):**
```typescript
import { login } from "@/lib/auth-client"
const result = await login(email, password)
```

### 3. عمليات قاعدة البيانات (Database Operations)

**قبل (Before):**
```typescript
const { data } = await supabase
  .from("dreams")
  .select("*")
  .eq("dreamer_id", userId)
```

**بعد (After):**
```typescript
import { prisma } from "@/lib/prisma"
const dreams = await prisma.dream.findMany({
  where: { dreamerId: userId }
})
```

---

## خطوات الهجرة (Migration Steps)

### الخطوة 1: تصدير البيانات من Supabase

إذا كان لديك بيانات موجودة في Supabase:

1. افتح Supabase Dashboard
2. اذهب إلى Database → Backups
3. قم بتصدير البيانات كـ SQL dump
4. أو استخدم `pg_dump`:

```bash
pg_dump "your-supabase-connection-string" > backup.sql
```

### الخطوة 2: إعداد قاعدة البيانات الجديدة

```bash
# إنشاء قاعدة بيانات جديدة
createdb tafseer_elahlam

# أو باستخدام PostgreSQL CLI
psql -U postgres
CREATE DATABASE tafseer_elahlam;
\q
```

### الخطوة 3: تكوين Prisma

قم بتحديث `.env`:

```env
# استبدل هذا
# NEXT_PUBLIC_SUPABASE_URL="..."
# NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# بهذا
DATABASE_URL="postgresql://username:password@localhost:5432/tafseer_elahlam?schema=public"
JWT_SECRET="your-secure-jwt-secret"
```

### الخطوة 4: تشغيل Prisma Migrations

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق Schema على قاعدة البيانات
npx prisma db push

# (اختياري) فتح Prisma Studio
npx prisma studio
```

### الخطوة 5: استيراد البيانات (إن وجدت)

إذا كان لديك بيانات من Supabase:

```bash
# استيراد البيانات
psql -U username -d tafseer_elahlam < backup.sql
```

⚠️ **ملاحظة**: قد تحتاج إلى تعديل SQL dump لأن:
- جدول `auth.users` في Supabase أصبح `users` و `profiles`
- أسماء الأعمدة تغيرت من `snake_case` لتتوافق مع Prisma

### الخطوة 6: تحديث الكود

#### API Routes

```typescript
// قبل (Before)
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// بعد (After)
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
const session = await getSession()
```

#### Client Components

```typescript
// قبل (Before)
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// بعد (After)
import { getCurrentUser, login, logout } from "@/lib/auth-client"
```

---

## تعديلات Schema (Schema Changes)

### جدول المستخدمين (Users Table)

**Supabase:**
```sql
-- auth.users (managed by Supabase)
-- profiles table references auth.users
```

**Prisma:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // hashed
  profile   Profile?
}

model Profile {
  id      String @id
  email   String @unique
  // ... other fields
  user    User   @relation(fields: [id], references: [id])
}
```

### تعديلات أسماء الحقول (Field Name Changes)

| Supabase (snake_case) | Prisma (camelCase) |
|----------------------|-------------------|
| `dreamer_id` | `dreamerId` |
| `interpreter_id` | `interpreterId` |
| `dream_date` | `dreamDate` |
| `full_name` | `fullName` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

## API Endpoints التي تغيرت (Changed API Endpoints)

### Authentication

| الوظيفة | Supabase | Prisma |
|---------|----------|--------|
| تسجيل الدخول | `supabase.auth.signInWithPassword()` | `POST /api/auth/login` |
| التسجيل | `supabase.auth.signUp()` | `POST /api/auth/register` |
| تسجيل الخروج | `supabase.auth.signOut()` | `POST /api/auth/logout` |
| المستخدم الحالي | `supabase.auth.getUser()` | `GET /api/auth/me` |

### Database Operations

| الوظيفة | Supabase | Prisma |
|---------|----------|--------|
| قراءة | `supabase.from('table').select()` | `prisma.table.findMany()` |
| إنشاء | `supabase.from('table').insert()` | `prisma.table.create()` |
| تحديث | `supabase.from('table').update()` | `prisma.table.update()` |
| حذف | `supabase.from('table').delete()` | `prisma.table.delete()` |

---

## استكشاف المشاكل (Troubleshooting)

### مشكلة: Password Hash Migration

إذا كنت تهاجر مستخدمين موجودين من Supabase:

**المشكلة**: Supabase يستخدم bcrypt مع معاملات مختلفة

**الحل**: 
1. اطلب من المستخدمين إعادة تعيين كلمات المرور
2. أو: اكتب script لإعادة تشفير كلمات المرور

### مشكلة: UUID Format

إذا واجهت مشكلة في صيغة UUID:

```typescript
// تأكد من استخدام uuid() بدلاً من gen_random_uuid()
@default(uuid())
```

### مشكلة: Relations Not Working

تأكد من:
1. جميع العلاقات معرفة بشكل صحيح في schema.prisma
2. Foreign keys موجودة في قاعدة البيانات
3. نفذت `npx prisma generate` بعد أي تغيير

---

## Rollback Plan (خطة الرجوع)

إذا احتجت للرجوع إلى Supabase:

1. احتفظ بنسخة احتياطية من `.env` الأصلية
2. احتفظ بنسخة من ملفات `lib/supabase/`
3. لديك backup من قاعدة بيانات Supabase

```bash
# Restore Supabase files
git checkout lib/supabase/

# Update .env
# استعد NEXT_PUBLIC_SUPABASE_* variables
```

---

## الفوائد بعد الهجرة (Benefits After Migration)

✅ **تحكم أفضل**: تحكم كامل في قاعدة البيانات والمصادقة
✅ **مرونة أكبر**: سهولة تخصيص المصادقة والصلاحيات
✅ **Type Safety**: Prisma يوفر type safety أفضل
✅ **Performance**: استعلامات محسنة مع Prisma
✅ **Cost**: تكلفة أقل بدون Supabase subscription
✅ **Independence**: عدم الاعتماد على خدمة خارجية

---

## الدعم (Support)

إذا واجهت أي مشاكل أثناء الهجرة:

1. تحقق من [Prisma Documentation](https://www.prisma.io/docs)
2. راجع [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
3. افتح issue في المشروع

---

**تاريخ الهجرة**: 2025-01-20  
**الإصدار**: 1.0.0

