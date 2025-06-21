# تحميل غرموف من Replit

## طريقة التحميل من Replit

### الخيار الأول: تحميل ملفات فردية
1. في Replit Files panel (الجانب الأيسر)
2. انقر بالزر الأيمن على كل ملف
3. اختر "Download"
4. احفظ في مجلد على جهازك

### الخيار الأثاني: تحميل كامل
1. في Replit، اذهب إلى قائمة "⋮" (ثلاث نقاط)
2. اختر "Download as zip"
3. سيتم تحميل جميع ملفات المشروع

## الملفات الأساسية المطلوبة

### ملفات حاسمة (يجب تحميلها):
- `main.js` - الخادم الرئيسي
- `package.json` - متطلبات المشروع
- `vercel.json` - تكوين النشر
- `api/index.js` - خادم Vercel
- `README.md` - التوثيق

### ملفات مهمة:
- `package-lock.json` - قفل الإصدارات
- `.gitignore` - استبعاد الملفات
- `simple-build.js` - بناء المشروع
- `angular.json` - تكوين Angular
- جميع ملفات `.md` للتوثيق

### مجلدات كاملة:
- `src/` - ملفات Angular
- `server/` - ملفات الخادم
- `api/` - مجلد Vercel
- `attached_assets/` - الملفات المرفقة

## رفع على GitHub

### إنشاء Repository:
1. اذهب إلى https://github.com/ghurm2030
2. انقر "New repository"
3. اسم: `survey-builder`
4. وصف: `منصة غرموف لبناء وإدارة الاستبيانات العربية`
5. اختر Public
6. انقر "Create repository"

### رفع الملفات:
1. في Repository الجديد، انقر "uploading an existing file"
2. اسحب جميع الملفات المحملة
3. رسالة Commit:
   ```
   Initial commit: غرموف - منصة الاستبيانات العربية

   - خادم Express مع واجهة عربية متكاملة  
   - نظام مصادقة مرن (اسم/بريد/جوال)
   - APIs متكاملة للاستبيانات والأسئلة
   - محسن للنشر على Vercel
   ```
4. انقر "Commit changes"

## نشر على Vercel

### ربط GitHub:
1. اذهب إلى https://vercel.com
2. سجل دخول أو أنشئ حساب
3. انقر "New Project"
4. اختر "Import Git Repository"
5. اختر `ghurm2030/survey-builder`

### إعدادات النشر:
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: (اتركه فارغ)
- **Output Directory**: (اتركه فارغ)  
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### متغيرات البيئة:
أضف في Vercel:
- `NODE_ENV` = `production`

## بعد النشر

### رابط المشروع:
ستحصل على رابط مثل:
`https://survey-builder-abc123.vercel.app`

### التحقق:
- الصفحة الرئيسية تعرض "غرموف"
- الواجهة باللغة العربية
- APIs تعمل على `/api/health`
- الحسابات التجريبية متاحة

### حسابات تجريبية:
- `admin` - مدير النظام
- `user1` - مستخدم عادي
- `test@example.com` - مستخدم بريد
- `0501234567` - مستخدم جوال

## حل المشاكل

### مشكلة: Build فشل
- تأكد من رفع `package.json`
- تحقق من وجود `api/index.js`

### مشكلة: Function Error
- راجع Vercel Dashboard للـ logs
- تأكد من صحة `vercel.json`

### مشكلة: APIs لا تعمل
- تأكد من مجلد `api/` مرفوع
- فحص `api/index.js` موجود

النظام سيعمل فوراً بعد النشر مع جميع المميزات!