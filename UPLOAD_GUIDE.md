# دليل رفع غرموف على GitHub

## الخطوات المطلوبة لرفع المشروع

### 1. إعداد Git Repository

```bash
# تهيئة Git في مجلد المشروع
git init

# إضافة جميع الملفات
git add .

# إنشاء أول commit
git commit -m "Initial commit: غرموف - منصة الاستبيانات العربية

- خادم Express مع واجهة عربية متكاملة
- نظام مصادقة مرن (اسم/بريد/جوال)  
- إدارة المستخدمين والصلاحيات
- APIs متكاملة للاستبيانات والأسئلة
- تصميم متجاوب مع تدرجات لونية
- محسن للنشر على Vercel"

# تعيين الفرع الرئيسي
git branch -M main

# ربط Repository المحدد
git remote add origin https://github.com/ghurm2030/survey-builder.git

# رفع الكود
git push -u origin main
```

### 2. التحقق من Repository

بعد الرفع، تأكد من وجود الملفات التالية:

**الملفات الأساسية:**
- `main.js` - الخادم الرئيسي
- `package.json` - متطلبات المشروع
- `README.md` - التوثيق الأساسي
- `.gitignore` - استبعاد الملفات

**ملفات النشر:**
- `vercel.json` - تكوين Vercel
- `api/index.js` - خادم Vercel المحسن
- `VERCEL_DEPLOY.md` - دليل النشر

**ملفات التوثيق:**
- `DEPLOYMENT.md` - مشاكل النشر وحلولها
- `GITHUB_SETUP.md` - إعداد GitHub
- `UPLOAD_GUIDE.md` - هذا الدليل

### 3. نشر على Vercel

#### الطريقة الأولى: ربط GitHub مع Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول أو أنشئ حساب
3. انقر "New Project"
4. اختر "Import Git Repository"
5. اختر `ghurm2030/survey-builder`
6. انقر "Deploy"

#### الطريقة الثانية: Vercel CLI
```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

### 4. إعدادات Vercel المطلوبة

**Build Settings:**
- Framework Preset: Other
- Build Command: (اتركه فارغ)
- Output Directory: (اتركه فارغ)
- Install Command: `npm install`
- Root Directory: ./

**Environment Variables:**
- `NODE_ENV=production`

### 5. التحقق من النشر

بعد النشر، الرابط سيكون:
`https://survey-builder-[hash].vercel.app`

تأكد من:
- صفحة الرئيسية تظهر بشكل صحيح
- APIs تعمل (فحص `/api/health`)
- نظام المصادقة يعمل
- الواجهة العربية تظهر بشكل سليم

## الحسابات التجريبية

- **المدير**: `admin`
- **مستخدم عادي**: `user1`
- **بريد إلكتروني**: `test@example.com`
- **رقم جوال**: `0501234567`

## استكشاف الأخطاء

### مشكلة: Build فشل
- تأكد من وجود `package.json` صحيح
- تحقق من dependencies

### مشكلة: Function Timeout
- أضف maxDuration في `vercel.json`

### مشكلة: APIs لا تعمل
- تأكد من مجلد `api/` ووجود `index.js`
- فحص logs في Vercel Dashboard

## الدعم الفني

إذا واجهت مشاكل:
1. فحص logs في Vercel Dashboard
2. مراجعة `DEPLOYMENT.md` للحلول الشائعة
3. التأكد من تطابق الملفات مع هذا الدليل