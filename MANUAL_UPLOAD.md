# رفع غرموف يدوياً على GitHub

نظراً لقيود Replit على عمليات Git، يمكنك رفع المشروع يدوياً:

## الطريقة الأولى: رفع مباشر

### 1. إنشاء Repository على GitHub
1. اذهب إلى https://github.com/ghurm2030/survey-builder
2. إذا لم يكن موجوداً، انقر "New repository"
3. اسم Repository: `survey-builder`
4. الوصف: `منصة غرموف لبناء وإدارة الاستبيانات العربية`
5. اختر Public أو Private
6. انقر "Create repository"

### 2. رفع الملفات
1. في صفحة Repository الفارغة، انقر "uploading an existing file"
2. اسحب جميع ملفات المشروع من Replit
3. أو انقر "choose your files" واختر الملفات

### 3. الملفات المطلوبة للرفع

**الملفات الأساسية:**
- `main.js` - الخادم الرئيسي
- `package.json` - متطلبات المشروع
- `package-lock.json` - قفل الإصدارات
- `README.md` - التوثيق الأساسي
- `.gitignore` - استبعاد الملفات

**ملفات النشر:**
- `vercel.json` - تكوين Vercel
- `api/index.js` - خادم Vercel المحسن
- `VERCEL_DEPLOY.md` - دليل النشر

**ملفات التوثيق:**
- `DEPLOYMENT.md` - مشاكل النشر وحلولها
- `GITHUB_SETUP.md` - إعداد GitHub
- `UPLOAD_GUIDE.md` - دليل الرفع
- `MANUAL_UPLOAD.md` - هذا الدليل
- `project-info.json` - معلومات المشروع

**مجلدات:**
- `src/` - ملفات Angular
- `server/` - ملفات الخادم
- `attached_assets/` - الملفات المرفقة

### 4. رسالة Commit الأولى
```
Initial commit: غرموف - منصة الاستبيانات العربية

- خادم Express مع واجهة عربية متكاملة
- نظام مصادقة مرن (اسم/بريد/جوال)  
- إدارة المستخدمين والصلاحيات
- APIs متكاملة للاستبيانات والأسئلة
- تصميم متجاوب مع تدرجات لونية
- محسن للنشر على Vercel والمنصات السحابية
```

## الطريقة الثانية: تحميل ملف ZIP

### 1. تحميل المشروع من Replit
1. في Replit، انقر على قائمة "Files"
2. انقر "Download as ZIP"
3. احفظ الملف على جهازك

### 2. رفع ZIP على GitHub
1. في Repository على GitHub
2. انقر "Add file" → "Upload files"
3. اسحب ملف ZIP أو انقر "choose your files"
4. GitHub سيستخرج الملفات تلقائياً

## بعد الرفع

### النشر على Vercel
1. اذهب إلى https://vercel.com
2. انقر "New Project"
3. اختر "Import Git Repository"
4. اختر `ghurm2030/survey-builder`
5. إعدادات البناء:
   - Framework Preset: Other
   - Build Command: (فارغ)
   - Output Directory: (فارغ)
   - Install Command: `npm install`
6. انقر "Deploy"

### الرابط النهائي
بعد النشر ستحصل على رابط مثل:
`https://survey-builder-xyz.vercel.app`

## التحقق من النشر

تأكد من:
- صفحة الرئيسية تظهر "غرموف"
- الواجهة العربية تعمل بشكل صحيح
- APIs تستجيب على `/api/health`
- الحسابات التجريبية تعمل:
  - admin
  - user1  
  - test@example.com
  - 0501234567

## الدعم الفني

إذا واجهت مشاكل:
1. راجع `VERCEL_DEPLOY.md` للحلول الشائعة
2. فحص Vercel Dashboard للـ logs
3. تأكد من وجود جميع الملفات المطلوبة