const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'غرموف منصة الاستبيانات' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// User data
const users = {
  'admin': { id: 'admin', role: 'admin', name: 'مدير النظام' },
  'user1': { id: 'user1', role: 'user', name: 'مستخدم تجريبي' },
  'test@example.com': { id: 'email-user', role: 'user', name: 'مستخدم بريد' },
  '0501234567': { id: 'phone-user', role: 'user', name: 'مستخدم جوال' }
};

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  const user = users[identifier];
  if (user) {
    res.json({ success: true, user: { ...user, identifier } });
  } else {
    res.status(401).json({ message: 'المستخدم غير موجود' });
  }
});

// Users API
app.get('/api/users', (req, res) => {
  const userList = Object.entries(users).map(([key, user]) => ({ ...user, identifier: key }));
  res.json({ success: true, users: userList });
});

// Surveys API
app.get('/api/surveys', (req, res) => {
  res.json({ success: true, surveys: [] });
});

app.get('/api/surveys/generate-number', (req, res) => {
  const uniqueNumber = `SUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  res.json({ success: true, uniqueNumber });
});

// API health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', users: Object.keys(users).length });
});

// Catch all - main app interface
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>غرموف - منصة الاستبيانات</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; text-align: center; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 4em; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .status { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 30px 0; backdrop-filter: blur(10px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px; backdrop-filter: blur(10px); }
    .card h3 { margin: 0 0 15px 0; }
    .api-link { background: rgba(255,255,255,0.2); padding: 12px; margin: 5px 0; border-radius: 8px; text-decoration: none; color: white; display: block; transition: all 0.3s; }
    .api-link:hover { background: rgba(255,255,255,0.3); }
    .user-item { background: rgba(255,255,255,0.1); padding: 12px; margin: 8px 0; border-radius: 6px; text-align: right; }
    code { background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>غرموف</h1>
    <p style="font-size: 1.3em;">منصة بناء وإدارة الاستبيانات العربية</p>
    
    <div class="status">
      <h2>النظام يعمل بنجاح</h2>
      <p>جميع الخدمات متاحة وجاهزة للاستخدام</p>
    </div>
    
    <div class="grid">
      <div class="card">
        <h3>واجهات البرمجة</h3>
        <a href="/api/health" class="api-link">فحص حالة النظام</a>
        <a href="/api/users" class="api-link">قائمة المستخدمين</a>
        <a href="/api/surveys" class="api-link">قائمة الاستبيانات</a>
        <a href="/health" class="api-link">فحص الخادم</a>
      </div>
      
      <div class="card">
        <h3>حسابات تجريبية</h3>
        <div class="user-item"><strong>المدير:</strong> <code>admin</code></div>
        <div class="user-item"><strong>مستخدم عادي:</strong> <code>user1</code></div>
        <div class="user-item"><strong>بريد إلكتروني:</strong> <code>test@example.com</code></div>
        <div class="user-item"><strong>رقم جوال:</strong> <code>0501234567</code></div>
      </div>
      
      <div class="card">
        <h3>مميزات النظام</h3>
        <ul style="list-style: none; padding: 0; text-align: right;">
          <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">نظام مصادقة مرن</li>
          <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">إدارة المستخدمين</li>
          <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">إنشاء الاستبيانات</li>
          <li style="padding: 8px 0;">واجهة عربية متكاملة</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`غرموف يعمل على البورت ${PORT}`);
  console.log('النظام جاهز للاستخدام');
});

process.on('SIGTERM', () => {
  console.log('إيقاف الخادم');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('إيقاف الخادم');
  server.close(() => process.exit(0));
});