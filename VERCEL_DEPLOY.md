# نشر غرموف على Vercel

## الملفات المطلوبة للنشر

تم إنشاء الملفات التالية للنشر على Vercel:

### 1. vercel.json
ملف تكوين Vercel الأساسي يحدد:
- نقطة الدخول: `main.js`
- التوجيه: جميع الطلبات تذهب للخادم الأساسي
- متغيرات البيئة المطلوبة

### 2. api/index.js
خادم Express محسن لـ Vercel مع:
- جميع APIs الأساسية
- واجهة HTML مدمجة
- نظام مصادقة كامل
- حسابات تجريبية جاهزة

## خطوات النشر

### الطريقة الأولى: Vercel CLI
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

### الطريقة الثانية: GitHub Integration
1. ادفع الكود إلى GitHub repository
2. اذهب إلى [vercel.com](https://vercel.com)
3. انقر "New Project"
4. اختر GitHub repository
5. اتبع خطوات النشر

### الطريقة الثالثة: رفع مباشر
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول أو أنشئ حساب
3. انقر "Add New Project"
4. اختر "Browse All Templates"
5. أو ارفع مجلد المشروع مباشرة

## إعدادات Vercel

### Build Settings
- **Framework Preset**: Other
- **Build Command**: `npm run build` (اختياري)
- **Output Directory**: اتركه فارغ
- **Install Command**: `npm install`

### Environment Variables
إضافة متغيرات البيئة إذا لزم الأمر:
- `NODE_ENV=production`

## بعد النشر

ستحصل على رابط مثل:
`https://ghurmoof-survey-platform.vercel.app`

النظام سيكون متاح فوراً مع:
- واجهة عربية متكاملة
- نظام مصادقة
- APIs جاهزة
- حسابات تجريبية

## استكشاف الأخطاء

### مشكلة شائعة: Function Timeout
إذا واجهت مشكلة timeout، أضف إلى `vercel.json`:
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### مشكلة: Missing Dependencies
تأكد من وجود جميع المكتبات في `package.json`

## مميزات النشر على Vercel

- نشر فوري وسريع
- HTTPS تلقائي
- نطاق مخصص مجاني
- إحصائيات وتحليلات
- نشر تلقائي من GitHub
- لا توجد قيود على الاستخدام للمشاريع الصغيرة