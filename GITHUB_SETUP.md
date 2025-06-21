# إعداد GitHub Repository لغرموف

## خطوات إنشاء Repository

### 1. إنشاء Repository جديد على GitHub
1. اذهب إلى [github.com](https://github.com)
2. انقر على "New repository"
3. اسم المشروع: `survey-builder`
4. الوصف: `منصة غرموف لبناء وإدارة الاستبيانات العربية`
5. اختر Public أو Private
6. لا تضع checkmark على Initialize README
7. انقر "Create repository"

### 2. رفع الكود

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit: غرموف - منصة الاستبيانات العربية"
git branch -M main
git remote add origin https://github.com/ghurm2030/survey-builder.git
git push -u origin main
```

### 3. إعداد GitHub Pages (اختياري)
1. اذهب إلى Settings في Repository
2. انتقل إلى Pages
3. اختر Source: Deploy from a branch
4. اختر Branch: main
5. Folder: / (root)

### 4. إعداد Actions للنشر التلقائي

إنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## ملفات المشروع الجاهزة للرفع

الملفات التالية جاهزة ومحسنة:

- `main.js` - الخادم الأساسي
- `package.json` - متطلبات المشروع  
- `README.md` - توثيق المشروع
- `DEPLOYMENT.md` - دليل النشر
- `.gitignore` - ملفات مستبعدة من Git
- `replit.toml` - تكوين Replit
- `simple-build.js` - بناء المشروع

## خطوات النشر على منصات أخرى

### Vercel
1. اربط GitHub Repository مع Vercel
2. استخدم الإعدادات التالية:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Netlify  
1. اربط GitHub Repository مع Netlify
2. الإعدادات:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Heroku
```bash
heroku create ghurmoof-app
git push heroku main
```

المشروع جاهز للرفع والنشر على أي منصة تختارها.