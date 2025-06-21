# دليل النشر - غرموف

## مشاكل النشر في Replit

خلال تطوير غرموف، واجهنا عدة مشاكل في منصة Replit:

### المشاكل المحددة:
1. **فشل فحوص الحالة الصحية**: الـ health checks تفشل مع خطأ status 000
2. **مشاكل في بدء الخادم**: Node.js لا يبدأ بشكل صحيح في البيئة المحلية
3. **تضارب في تكوين النشر**: ملفات `.replit` و `replit.toml` تحتاج تحديث مستمر
4. **مشاكل الشبكة**: الاتصال المحلي على localhost:3000 لا يعمل

### الحلول المطبقة:
- إنشاء خوادم متعددة مبسطة (Express و HTTP أساسي)
- تحسين تكوين `replit.toml` عدة مرات
- تبسيط عملية البناء في `simple-build.js`

## خيارات النشر البديلة

### 1. GitHub + Vercel
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/ghurmoof.git
git push -u origin main
```
ثم ربط Repository بـ Vercel للنشر التلقائي.

### 2. GitHub + Netlify
نفس الخطوات مع ربط Repository بـ Netlify.

### 3. Heroku
```bash
heroku create ghurmoof-app
git push heroku main
```

### 4. Railway
```bash
railway login
railway new
railway up
```

## النشر المحلي

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم
node main.js
```

الخادم سيعمل على `http://localhost:3000`

## تكوين البيئة

```bash
# متغيرات البيئة المطلوبة
PORT=3000
NODE_ENV=production
```

## ملاحظات للتطوير

- استخدم `main.js` كنقطة دخول أساسية
- الخادم محسن للعمل مع Express.js
- جميع الـ APIs تعمل بدون قاعدة بيانات (in-memory storage)
- الواجهة مدمجة في الخادم لتجنب تعقيدات النشر