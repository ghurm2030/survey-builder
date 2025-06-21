# تعليمات تحميل ورفع غرموف

## الملف المضغوط الجاهز
تم إنشاء ملف مضغوط للمشروع: `ghurmoof-survey-platform.tar.gz`

## محتويات الملف المضغوط

### الملفات الأساسية
- `main.js` - الخادم الرئيسي (5.6 KB)
- `package.json` - متطلبات المشروع (1.4 KB)
- `package-lock.json` - قفل الإصدارات (476 KB)
- `README.md` - التوثيق الأساسي (2.7 KB)
- `.gitignore` - استبعاد الملفات

### ملفات النشر
- `vercel.json` - تكوين Vercel (224 bytes)
- `api/index.js` - خادم Vercel المحسن (5.2 KB)
- `replit.toml` - تكوين Replit
- `simple-build.js` - سكريبت البناء

### دلائل التوثيق
- `DEPLOYMENT.md` - مشاكل النشر وحلولها
- `VERCEL_DEPLOY.md` - دليل النشر على Vercel  
- `GITHUB_SETUP.md` - إعداد GitHub
- `UPLOAD_GUIDE.md` - دليل الرفع الأصلي
- `MANUAL_UPLOAD.md` - دليل الرفع اليدوي
- `FILES_LIST.md` - قائمة الملفات
- `project-info.json` - معلومات المشروع
- `replit.md` - سجل التطوير

### مجلدات المشروع
- `src/` - ملفات Angular الكاملة
- `server/` - ملفات الخادم والنماذج
- `attached_assets/` - الملفات المرفقة

## خطوات التحميل والرفع

### 1. تحميل الملف المضغوط
1. في Replit، انقر على ملف `ghurmoof-survey-platform.tar.gz`
2. انقر "Download" أو استخدم النقر الأيمن "Save as"
3. احفظ الملف على جهازك
4. استخرج الملف باستخدام WinRAR أو 7-Zip أو أي برنامج استخراج

### 2. رفع على GitHub
1. اذهب إلى https://github.com/ghurm2030/survey-builder
2. إذا لم يكن Repository موجوداً، أنشئه بالاسم `survey-builder`
3. انقر "Add file" → "Upload files"
4. اسحب ملف `ghurmoof-survey-platform.tar.gz` أو استخرج محتوياته ثم اسحب الملفات 
5. GitHub سيستخرج الملفات تلقائياً
6. أضف رسالة commit:
   ```
   Initial commit: غرموف - منصة الاستبيانات العربية
   
   - خادم Express مع واجهة عربية متكاملة
   - نظام مصادقة مرن (اسم/بريد/جوال)  
   - APIs متكاملة للاستبيانات والأسئلة
   - محسن للنشر على Vercel
   ```
7. انقر "Commit changes"

### 3. النشر على Vercel
1. اذهب إلى https://vercel.com
2. انقر "New Project"
3. اختر "Import Git Repository"
4. اختر `ghurm2030/survey-builder`
5. إعدادات البناء:
   - Framework Preset: Other
   - Build Command: (اتركه فارغ)
   - Output Directory: (اتركه فارغ)
   - Install Command: `npm install`
6. انقر "Deploy"

## بعد النشر

### الرابط النهائي
ستحصل على رابط مثل: `https://survey-builder-xyz.vercel.app`

### التحقق من التشغيل
- الصفحة الرئيسية تعرض "غرموف"
- الواجهة العربية تعمل بشكل صحيح
- APIs متاحة على `/api/health`
- الحسابات التجريبية تعمل

### الحسابات التجريبية
- **المدير**: `admin`
- **مستخدم عادي**: `user1`  
- **بريد إلكتروني**: `test@example.com`
- **رقم جوال**: `0501234567`

## حجم الملف
- الملف المضغوط: تقريباً 1-2 MB
- بعد الاستخراج: حوالي 5-10 MB (بدون node_modules)
- node_modules سيتم تثبيته تلقائياً عند النشر

## استكشاف الأخطاء
إذا واجهت مشاكل، راجع:
- `VERCEL_DEPLOY.md` للحلول الشائعة
- `DEPLOYMENT.md` لمشاكل النشر العامة
- Vercel Dashboard للـ logs والأخطاء