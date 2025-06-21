const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint for health checks - deployment critical
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('يجب أن يكون الملف من نوع Excel (.xlsx/.xls) أو Word (.docx/.doc)'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// In-memory storage
const users = new Map([
  ['admin', {
    id: 'admin-id',
    identifier: 'admin',
    type: 'name',
    role: 'admin',
    name: 'مدير النظام',
    isActive: true,
    createdBy: 'system',
    createdAt: new Date()
  }],
  ['user1', {
    id: 'user1-id',
    identifier: 'user1',
    type: 'name',
    role: 'user',
    name: 'مستخدم تجريبي',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date()
  }]
]);

const surveys = new Map();
const questions = new Map();

// OpenAI configuration
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// API Routes

// Auth
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  
  if (!identifier || identifier.trim().length < 3) {
    return res.status(400).json({
      message: 'يجب إدخال اسم صالح أو رقم جوال أو بريد إلكتروني'
    });
  }

  const user = users.get(identifier.trim());
  
  if (!user || !user.isActive) {
    return res.status(401).json({
      message: 'المستخدم غير موجود أو غير مفعل'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      identifier: user.identifier,
      type: user.type,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt
    }
  });
});

// Users
app.get('/api/users', (req, res) => {
  const { role, isActive } = req.query;
  let userList = Array.from(users.values());
  
  if (role) userList = userList.filter(user => user.role === role);
  if (isActive !== undefined) userList = userList.filter(user => user.isActive === (isActive === 'true'));

  res.json({
    success: true,
    users: userList.map(user => ({
      id: user.id,
      identifier: user.identifier,
      type: user.type,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdBy: user.createdBy,
      createdAt: user.createdAt
    }))
  });
});

app.post('/api/users', (req, res) => {
  const { identifier, role, name, email, phone, createdBy } = req.body;

  if (!identifier || !role || !createdBy) {
    return res.status(400).json({ message: 'المعرف والدور ومنشئ المستخدم مطلوبة' });
  }

  if (users.has(identifier.trim())) {
    return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
  }

  const determineType = (id) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) return 'email';
    if (/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(id)) return 'phone';
    return 'name';
  };

  const newUser = {
    id: Date.now().toString(),
    identifier: identifier.trim(),
    type: determineType(identifier.trim()),
    role,
    name: name?.trim(),
    email: email?.trim(),
    phone: phone?.trim(),
    isActive: true,
    createdBy: createdBy.trim(),
    createdAt: new Date()
  };

  users.set(identifier.trim(), newUser);
  res.status(201).json({ success: true, user: newUser });
});

app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  let userFound = null;
  for (const [key, user] of users.entries()) {
    if (user.id === id) {
      Object.assign(user, updates, { updatedAt: new Date() });
      userFound = user;
      break;
    }
  }
  
  if (!userFound) {
    return res.status(404).json({ message: 'المستخدم غير موجود' });
  }
  
  res.json({ success: true, user: userFound });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  for (const [key, user] of users.entries()) {
    if (user.id === id) {
      users.delete(key);
      return res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
    }
  }
  
  res.status(404).json({ message: 'المستخدم غير موجود' });
});

// General surveys endpoint - returns all surveys
app.get('/api/surveys', (req, res) => {
  const allSurveys = Array.from(surveys.values())
    .map(survey => ({
      ...survey,
      questionsCount: Array.from(questions.values()).filter(q => q.surveyId === survey.id).length
    }));

  res.json({ success: true, surveys: allSurveys });
});

// Surveys
app.post('/api/surveys', (req, res) => {
  const { uniqueNumber, descriptionArabic, descriptionEnglish, startDateTime, endDateTime, createdBy } = req.body;

  if (!uniqueNumber || !descriptionArabic || !descriptionEnglish || !startDateTime || !endDateTime || !createdBy) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  const id = Date.now().toString();
  const survey = {
    id,
    uniqueNumber,
    descriptionArabic,
    descriptionEnglish,
    startDateTime: new Date(startDateTime),
    endDateTime: new Date(endDateTime),
    createdBy,
    createdAt: new Date()
  };

  surveys.set(id, survey);
  res.status(201).json({ success: true, survey });
});

app.get('/api/surveys/user/:createdBy', (req, res) => {
  const { createdBy } = req.params;
  const userSurveys = Array.from(surveys.values())
    .filter(survey => survey.createdBy === createdBy)
    .map(survey => ({
      ...survey,
      questionsCount: Array.from(questions.values()).filter(q => q.surveyId === survey.id).length
    }));

  res.json({ success: true, surveys: userSurveys });
});

app.get('/api/surveys/generate-unique-number', (req, res) => {
  const uniqueNumber = 'SUR' + Date.now() + Math.floor(Math.random() * 1000);
  res.json({ success: true, uniqueNumber });
});

// Excel template download
app.get('/api/surveys/download-template', (req, res) => {
  const templateData = [
    ['رقم الاستبيان الفريد', 'الوصف بالعربية', 'الوصف بالإنجليزية', 'تاريخ البداية', 'تاريخ النهاية', 'منشئ الاستبيان'],
    ['SUR1234567890', 'استبيان تجريبي', 'Sample Survey', '2025-01-01 10:00', '2025-12-31 23:59', 'admin'],
    ['', '', '', '', '', ''],
    ['ملاحظات:', '', '', '', '', ''],
    ['- تاريخ البداية والنهاية يجب أن يكون بالصيغة: YYYY-MM-DD HH:MM', '', '', '', '', ''],
    ['- رقم الاستبيان الفريد يجب أن يكون فريداً', '', '', '', '', ''],
    ['- جميع الحقول مطلوبة عدا منشئ الاستبيان (سيتم استخدام المستخدم الحالي)', '', '', '', '', '']
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قالب الاستبيانات');

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // رقم الاستبيان
    { wch: 25 }, // الوصف بالعربية
    { wch: 25 }, // الوصف بالإنجليزية
    { wch: 18 }, // تاريخ البداية
    { wch: 18 }, // تاريخ النهاية
    { wch: 15 }  // منشئ الاستبيان
  ];

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename="survey-template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Excel file upload for surveys
app.post('/api/surveys/upload-excel', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
    }

    const { createdBy } = req.body;
    if (!createdBy) {
      return res.status(400).json({ message: 'يجب تحديد منشئ الاستبيان' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      return res.status(400).json({ message: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
    }

    const headers = data[0];
    const expectedHeaders = ['رقم الاستبيان الفريد', 'الوصف بالعربية', 'الوصف بالإنجليزية', 'تاريخ البداية', 'تاريخ النهاية'];
    
    // Validate headers
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (!headers[i] || !headers[i].includes(expectedHeaders[i].split(' ')[0])) {
        return res.status(400).json({ 
          message: `عمود مطلوب مفقود: ${expectedHeaders[i]}. تأكد من استخدام القالب الصحيح.` 
        });
      }
    }

    const createdSurveys = [];
    const errors = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;

      try {
        const uniqueNumber = row[0].toString().trim();
        const descriptionArabic = row[1]?.toString().trim();
        const descriptionEnglish = row[2]?.toString().trim();
        const startDateTime = row[3]?.toString().trim();
        const endDateTime = row[4]?.toString().trim();
        const rowCreatedBy = row[5]?.toString().trim() || createdBy;

        // Validate required fields
        if (!uniqueNumber || !descriptionArabic || !descriptionEnglish || !startDateTime || !endDateTime) {
          errors.push(`الصف ${i + 1}: حقول مطلوبة مفقودة`);
          continue;
        }

        // Check if survey already exists
        const existingSurvey = Array.from(surveys.values()).find(s => s.uniqueNumber === uniqueNumber);
        if (existingSurvey) {
          errors.push(`الصف ${i + 1}: رقم الاستبيان ${uniqueNumber} موجود مسبقاً`);
          continue;
        }

        // Parse dates
        let startDate, endDate;
        try {
          startDate = new Date(startDateTime);
          endDate = new Date(endDateTime);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('تاريخ غير صالح');
          }
          
          if (startDate >= endDate) {
            throw new Error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
          }
        } catch (dateError) {
          errors.push(`الصف ${i + 1}: ${dateError.message}`);
          continue;
        }

        // Create survey
        const id = Date.now().toString() + '_' + i;
        const survey = {
          id,
          uniqueNumber,
          descriptionArabic,
          descriptionEnglish,
          startDateTime: startDate,
          endDateTime: endDate,
          createdBy: rowCreatedBy,
          createdAt: new Date()
        };

        surveys.set(id, survey);
        createdSurveys.push(survey);

      } catch (error) {
        errors.push(`الصف ${i + 1}: خطأ في معالجة البيانات - ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `تم إنشاء ${createdSurveys.length} استبيان بنجاح`,
      createdSurveys: createdSurveys.length,
      errors: errors.length > 0 ? errors : undefined,
      surveys: createdSurveys
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ 
      message: 'خطأ في معالجة الملف: ' + error.message 
    });
  }
});

// Word template download
app.get('/api/surveys/download-word-template', (req, res) => {
  try {
    // Create a simple Word document template
    const templateContent = `
استمارة إنشاء الاستبيانات - قالب Word

تعليمات الاستخدام:
- قم بملء البيانات التالية لكل استبيان
- احفظ الملف بصيغة .docx
- ارفع الملف من خلال النظام

نموذج الاستبيان:

رقم الاستبيان الفريد: SUR1234567890
الوصف بالعربية: استبيان تجريبي
الوصف بالإنجليزية: Sample Survey
تاريخ البداية: 2025-01-01 10:00
تاريخ النهاية: 2025-12-31 23:59
منشئ الاستبيان: admin

---

استبيان جديد:

رقم الاستبيان الفريد: 
الوصف بالعربية: 
الوصف بالإنجليزية: 
تاريخ البداية: 
تاريخ النهاية: 
منشئ الاستبيان: 

---

ملاحظات مهمة:
1. رقم الاستبيان الفريد يجب أن يكون فريداً
2. تاريخ البداية والنهاية بالصيغة: YYYY-MM-DD HH:MM
3. جميع الحقول مطلوبة عدا منشئ الاستبيان
4. يمكن إضافة عدة استبيانات في نفس الملف
5. افصل بين كل استبيان بخط فاصل (---)
    `;

    // Create a simple text buffer (we'll create a basic docx)
    const buffer = Buffer.from(templateContent, 'utf8');
    
    res.setHeader('Content-Disposition', 'attachment; filename="survey-template.txt"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(buffer);
    
  } catch (error) {
    console.error('Word template error:', error);
    res.status(500).json({ message: 'خطأ في إنشاء القالب: ' + error.message });
  }
});

// Word file upload for surveys
app.post('/api/surveys/upload-word', upload.single('wordFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
    }

    const { createdBy } = req.body;
    if (!createdBy) {
      return res.status(400).json({ message: 'يجب تحديد منشئ الاستبيان' });
    }

    // Extract text from Word document
    mammoth.extractRawText({ buffer: req.file.buffer })
      .then(function(result) {
        const text = result.text;
        const createdSurveys = [];
        const errors = [];

        try {
          // Parse the text content
          const surveyData = parseWordContent(text, createdBy);
          
          surveyData.forEach((survey, index) => {
            try {
              // Validate survey data
              if (!survey.uniqueNumber || !survey.descriptionArabic || 
                  !survey.descriptionEnglish || !survey.startDateTime || 
                  !survey.endDateTime) {
                errors.push(`الاستبيان ${index + 1}: حقول مطلوبة مفقودة`);
                return;
              }

              // Check if survey already exists
              const existingSurvey = Array.from(surveys.values()).find(s => s.uniqueNumber === survey.uniqueNumber);
              if (existingSurvey) {
                errors.push(`الاستبيان ${index + 1}: رقم الاستبيان ${survey.uniqueNumber} موجود مسبقاً`);
                return;
              }

              // Parse dates
              const startDate = new Date(survey.startDateTime);
              const endDate = new Date(survey.endDateTime);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                errors.push(`الاستبيان ${index + 1}: تاريخ غير صالح`);
                return;
              }
              
              if (startDate >= endDate) {
                errors.push(`الاستبيان ${index + 1}: تاريخ البداية يجب أن يكون قبل تاريخ النهاية`);
                return;
              }

              // Create survey
              const id = Date.now().toString() + '_word_' + index;
              const newSurvey = {
                id,
                uniqueNumber: survey.uniqueNumber,
                descriptionArabic: survey.descriptionArabic,
                descriptionEnglish: survey.descriptionEnglish,
                startDateTime: startDate,
                endDateTime: endDate,
                createdBy: survey.createdBy || createdBy,
                createdAt: new Date()
              };

              surveys.set(id, newSurvey);
              createdSurveys.push(newSurvey);

            } catch (error) {
              errors.push(`الاستبيان ${index + 1}: خطأ في معالجة البيانات - ${error.message}`);
            }
          });

          res.json({
            success: true,
            message: `تم إنشاء ${createdSurveys.length} استبيان بنجاح من ملف Word`,
            createdSurveys: createdSurveys.length,
            errors: errors.length > 0 ? errors : undefined,
            surveys: createdSurveys
          });

        } catch (parseError) {
          res.status(400).json({ 
            message: 'خطأ في تحليل محتوى الملف: ' + parseError.message 
          });
        }
      })
      .catch(function(error) {
        console.error('Mammoth error:', error);
        res.status(500).json({ 
          message: 'خطأ في قراءة ملف Word: ' + error.message 
        });
      });

  } catch (error) {
    console.error('Word upload error:', error);
    res.status(500).json({ 
      message: 'خطأ في معالجة الملف: ' + error.message 
    });
  }
});

// Helper function to parse Word content
function parseWordContent(text, defaultCreatedBy) {
  const surveyList = [];
  const sections = text.split('---').filter(section => section.trim());
  
  sections.forEach(section => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    const surveyData = {};
    
    lines.forEach(line => {
      if (line.includes('رقم الاستبيان الفريد:')) {
        surveyData.uniqueNumber = line.split(':')[1]?.trim();
      } else if (line.includes('الوصف بالعربية:')) {
        surveyData.descriptionArabic = line.split(':')[1]?.trim();
      } else if (line.includes('الوصف بالإنجليزية:')) {
        surveyData.descriptionEnglish = line.split(':')[1]?.trim();
      } else if (line.includes('تاريخ البداية:')) {
        surveyData.startDateTime = line.split(':')[1]?.trim();
      } else if (line.includes('تاريخ النهاية:')) {
        surveyData.endDateTime = line.split(':')[1]?.trim();
      } else if (line.includes('منشئ الاستبيان:')) {
        surveyData.createdBy = line.split(':')[1]?.trim() || defaultCreatedBy;
      }
    });
    
    // Only add if we have at least the unique number
    if (surveyData.uniqueNumber && surveyData.uniqueNumber !== '') {
      surveyList.push(surveyData);
    }
  });
  
  return surveyList;
}

// Survey template generation endpoints
app.post('/api/surveys/generate-template', async (req, res) => {
  try {
    const { description, category, targetAudience, questionCount, createdBy } = req.body;

    if (!description || !createdBy) {
      return res.status(400).json({ message: 'الوصف ومنشئ الاستبيان مطلوبان' });
    }

    let generatedSurvey;

    if (openai) {
      // Use AI generation
      generatedSurvey = await generateSurveyWithAI(description, category, targetAudience, questionCount);
    } else {
      // Use predefined templates
      generatedSurvey = generateSurveyFromTemplate(description, category, targetAudience, questionCount);
    }

    // Create the survey
    const uniqueNumber = 'GEN' + Date.now() + Math.floor(Math.random() * 1000);
    const id = Date.now().toString();
    
    const survey = {
      id,
      uniqueNumber,
      descriptionArabic: generatedSurvey.descriptionArabic,
      descriptionEnglish: generatedSurvey.descriptionEnglish,
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy,
      createdAt: new Date()
    };

    surveys.set(id, survey);

    // Create questions
    const createdQuestions = [];
    generatedSurvey.questions.forEach((questionData, index) => {
      const questionId = Date.now().toString() + '_q_' + index;
      const question = {
        id: questionId,
        surveyId: id,
        type: questionData.type,
        title: questionData.title,
        description: questionData.description,
        required: questionData.required || false,
        order: index + 1,
        options: questionData.options || [],
        validation: questionData.validation || {},
        createdAt: new Date()
      };
      
      questions.set(questionId, question);
      createdQuestions.push(question);
    });

    res.json({
      success: true,
      message: `تم إنشاء الاستبيان بنجاح مع ${createdQuestions.length} سؤال`,
      survey,
      questions: createdQuestions,
      generationMethod: openai ? 'AI' : 'Template'
    });

  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ 
      message: 'خطأ في إنشاء القالب: ' + error.message 
    });
  }
});

// Get predefined categories
app.get('/api/surveys/categories', (req, res) => {
  const categories = [
    { id: 'customer_satisfaction', name: 'رضا العملاء', nameEn: 'Customer Satisfaction' },
    { id: 'employee_feedback', name: 'تقييم الموظفين', nameEn: 'Employee Feedback' },
    { id: 'product_research', name: 'بحث المنتج', nameEn: 'Product Research' },
    { id: 'market_research', name: 'بحث السوق', nameEn: 'Market Research' },
    { id: 'event_feedback', name: 'تقييم الفعاليات', nameEn: 'Event Feedback' },
    { id: 'education', name: 'التعليم', nameEn: 'Education' },
    { id: 'healthcare', name: 'الرعاية الصحية', nameEn: 'Healthcare' },
    { id: 'general', name: 'عام', nameEn: 'General' }
  ];

  res.json({ success: true, categories });
});

// AI-powered survey generation
async function generateSurveyWithAI(description, category, targetAudience, questionCount = 5) {
  try {
    const prompt = `
You are a professional survey designer. Create a comprehensive survey based on the following requirements:

Description: ${description}
Category: ${category || 'general'}
Target Audience: ${targetAudience || 'general public'}
Number of Questions: ${questionCount || 5}

Please generate a survey with the following structure:
1. Arabic title and description
2. English title and description  
3. A list of relevant questions with different types (text, single_choice, multiple_choice, numeric, etc.)

Respond in JSON format with this exact structure:
{
  "descriptionArabic": "Arabic survey title and description",
  "descriptionEnglish": "English survey title and description",
  "questions": [
    {
      "type": "single_choice|multiple_choice|text|numeric|date|time|phone",
      "title": "Question text in Arabic",
      "description": "Optional question description",
      "required": true|false,
      "options": [{"text": "Option text", "value": "option_value"}] // only for choice questions
    }
  ]
}

Make sure to:
- Use appropriate question types for the survey purpose
- Include both required and optional questions
- Add relevant options for choice-type questions
- Keep questions clear and professional
- Focus on the specific category and target audience
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Add IDs to options
    if (result.questions) {
      result.questions.forEach(question => {
        if (question.options) {
          question.options = question.options.map((option, index) => ({
            id: `opt_${index + 1}`,
            text: option.text,
            value: option.value || option.text
          }));
        }
      });
    }

    return result;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('فشل في إنشاء الاستبيان باستخدام الذكاء الاصطناعي');
  }
}

// Template-based survey generation (fallback)
function generateSurveyFromTemplate(description, category, targetAudience, questionCount = 5) {
  const templates = {
    customer_satisfaction: {
      descriptionArabic: `استبيان رضا العملاء - ${description}`,
      descriptionEnglish: `Customer Satisfaction Survey - ${description}`,
      questions: [
        {
          type: 'single_choice',
          title: 'كيف تقيم مستوى رضاك العام عن خدماتنا؟',
          required: true,
          options: [
            { id: 'opt1', text: 'ممتاز', value: '5' },
            { id: 'opt2', text: 'جيد جداً', value: '4' },
            { id: 'opt3', text: 'جيد', value: '3' },
            { id: 'opt4', text: 'مقبول', value: '2' },
            { id: 'opt5', text: 'ضعيف', value: '1' }
          ]
        },
        {
          type: 'multiple_choice',
          title: 'ما هي الجوانب التي أعجبتك في خدماتنا؟',
          required: false,
          options: [
            { id: 'opt1', text: 'جودة الخدمة', value: 'quality' },
            { id: 'opt2', text: 'سرعة الاستجابة', value: 'speed' },
            { id: 'opt3', text: 'الأسعار المناسبة', value: 'pricing' },
            { id: 'opt4', text: 'التعامل المهني', value: 'professionalism' }
          ]
        },
        {
          type: 'text',
          title: 'ما هي اقتراحاتك لتحسين خدماتنا؟',
          required: false
        },
        {
          type: 'single_choice',
          title: 'هل تنصح بخدماتنا للآخرين؟',
          required: true,
          options: [
            { id: 'opt1', text: 'بالتأكيد', value: 'definitely' },
            { id: 'opt2', text: 'ربما', value: 'maybe' },
            { id: 'opt3', text: 'لا أعتقد ذلك', value: 'unlikely' },
            { id: 'opt4', text: 'بالتأكيد لا', value: 'definitely_not' }
          ]
        },
        {
          type: 'numeric',
          title: 'كم مرة استخدمت خدماتنا خلال العام الماضي؟',
          required: false,
          validation: { min: 0, max: 100 }
        }
      ]
    },
    employee_feedback: {
      descriptionArabic: `استبيان تقييم الموظفين - ${description}`,
      descriptionEnglish: `Employee Feedback Survey - ${description}`,
      questions: [
        {
          type: 'single_choice',
          title: 'كيف تقيم مستوى رضاك عن بيئة العمل؟',
          required: true,
          options: [
            { id: 'opt1', text: 'راضٍ جداً', value: '5' },
            { id: 'opt2', text: 'راضٍ', value: '4' },
            { id: 'opt3', text: 'محايد', value: '3' },
            { id: 'opt4', text: 'غير راضٍ', value: '2' },
            { id: 'opt5', text: 'غير راضٍ إطلاقاً', value: '1' }
          ]
        },
        {
          type: 'multiple_choice',
          title: 'ما هي التحديات الرئيسية التي تواجهها في العمل؟',
          required: false,
          options: [
            { id: 'opt1', text: 'ضغط العمل', value: 'workload' },
            { id: 'opt2', text: 'التواصل', value: 'communication' },
            { id: 'opt3', text: 'نقص الموارد', value: 'resources' },
            { id: 'opt4', text: 'التدريب', value: 'training' }
          ]
        },
        {
          type: 'text',
          title: 'ما هي مقترحاتك لتحسين بيئة العمل؟',
          required: false
        }
      ]
    }
  };

  const template = templates[category] || templates.customer_satisfaction;
  
  // Limit questions to requested count
  const limitedQuestions = template.questions.slice(0, questionCount);
  
  return {
    ...template,
    questions: limitedQuestions
  };
}

// Questions
app.post('/api/questions', (req, res) => {
  const { surveyId, type, title, description, required, options, validation } = req.body;

  if (!surveyId || !type || !title) {
    return res.status(400).json({ message: 'الحقول المطلوبة: معرف الاستبيان، نوع السؤال، عنوان السؤال' });
  }

  const existingQuestions = Array.from(questions.values()).filter(q => q.surveyId === surveyId);
  const order = existingQuestions.length + 1;

  const id = Date.now().toString();
  const question = {
    id,
    surveyId,
    type,
    title,
    description,
    required: required || false,
    order,
    options: options || [],
    validation: validation || {},
    createdAt: new Date()
  };

  questions.set(id, question);
  res.status(201).json({ success: true, question });
});

app.get('/api/questions/survey/:surveyId', (req, res) => {
  const { surveyId } = req.params;
  const surveyQuestions = Array.from(questions.values())
    .filter(q => q.surveyId === surveyId)
    .sort((a, b) => a.order - b.order);

  res.json({ success: true, questions: surveyQuestions });
});

app.delete('/api/questions/:questionId', (req, res) => {
  const { questionId } = req.params;
  
  if (questions.delete(questionId)) {
    res.json({ success: true, message: 'تم حذف السؤال بنجاح' });
  } else {
    res.status(404).json({ message: 'السؤال غير موجود' });
  }
});

app.patch('/api/questions/:questionId/order', (req, res) => {
  const { questionId } = req.params;
  const { newOrder } = req.body;

  const question = questions.get(questionId);
  if (!question) {
    return res.status(404).json({ message: 'السؤال غير موجود' });
  }

  question.order = newOrder;
  res.json({ success: true, question: { id: question.id, order: question.order } });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Ghurmoof Server is running',
    users: users.size,
    surveys: surveys.size,
    questions: questions.size,
    timestamp: new Date().toISOString()
  });
});

// Serve Angular build files (if they exist)
const buildPath = path.join(__dirname, 'dist/ghurmoof');
if (fs.existsSync(buildPath)) {
  console.log('✅ Serving Angular static files from:', buildPath);
  app.use(express.static(buildPath, {
    maxAge: '1d',
    etag: false
  }));
} else {
  console.log('⚠️  Angular build not found at:', buildPath);
}

// Catch all handler for Angular routing - avoid interfering with health checks
app.get('*', (req, res) => {
  // Skip catch-all for health endpoints
  if (req.path === '/' || req.path === '/health') {
    return;
  }
  
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <html dir="rtl">
          <head><title>غرموف - منصة الاستبيانات</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>مرحبا بك في غرموف</h1>
            <p>منصة بناء وإدارة الاستبيانات</p>
            <p>الخادم يعمل بنجاح</p>
          </body>
        </html>
      `);
    }
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ghurmoof Server running on port ${PORT}`);
  console.log(`📊 Users: ${users.size} | Surveys: ${surveys.size} | Questions: ${questions.size}`);
  console.log(`✅ Server ready at http://0.0.0.0:${PORT}`);
  console.log(`🌐 Preview available at external URL`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});