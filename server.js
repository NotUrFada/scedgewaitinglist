import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './services/db.js';
import { storage } from './services/storage.js';
import { ai } from './services/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, 'waitlist-data.json');

// Check if using Supabase or file storage
const useSupabase = db.isConfigured();
console.log(useSupabase ? '✅ Using Supabase database' : '📁 Using file storage (fallback)');

// CORS configuration - allow Vercel URLs and any explicitly set frontend URL
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel URLs (production and preview)
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow explicit frontend URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // In development, allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all origins for now (can be restricted later)
    // Log for debugging
    console.log('✅ Allowing CORS for origin:', origin);
    callback(null, true);
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

// Load emails from file
const loadEmails = () => {
  try {
    initializeDataFile();
    const data = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading emails:', error);
    return [];
  }
};

// Save emails to file
const saveEmails = (emails) => {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(emails, null, 2));
  } catch (error) {
    console.error('Error saving emails:', error);
    throw error;
  }
};

// Routes

// Helper function to get emails (from Supabase or file)
const getEmailsData = async () => {
  if (useSupabase) {
    return await db.getEmails();
  } else {
    return loadEmails();
  }
};

// Root route - show API info or simple email viewer
app.get('/', async (req, res) => {
  // If query parameter ?view=emails, show HTML viewer
  if (req.query.view === 'emails') {
    try {
      const emails = await getEmailsData();
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Scedge Waitlist - Email Viewer</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a; 
      color: #fff; 
      padding: 40px; 
      max-width: 1200px; 
      margin: 0 auto;
    }
    h1 { margin-bottom: 30px; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
    }
    th { 
      background: #2a2a2a; 
      padding: 15px; 
      text-align: left;
      font-weight: 600;
    }
    td { 
      padding: 15px; 
      border-top: 1px solid #2a2a2a;
    }
    tr:hover { background: #252525; }
    .count { color: #888; margin-bottom: 20px; }
    .refresh { 
      background: #fff; 
      color: #000; 
      border: none; 
      padding: 10px 20px; 
      border-radius: 6px; 
      cursor: pointer;
      margin-bottom: 20px;
    }
    .refresh:hover { background: #e0e0e0; }
  </style>
</head>
<body>
  <h1>📧 Scedge Waitlist Emails</h1>
  <div class="count">Total: ${emails.length} emails</div>
  <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
  <table>
    <thead>
      <tr>
        <th>Email</th>
        <th>Date</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${emails.length === 0 
        ? '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #888;">No emails yet</td></tr>'
        : emails.map(e => `
          <tr>
            <td>${e.email}</td>
            <td>${new Date(e.timestamp).toLocaleDateString()}</td>
            <td>${new Date(e.timestamp).toLocaleTimeString()}</td>
          </tr>
        `).join('')
      }
    </tbody>
  </table>
</body>
</html>`;
      res.send(html);
    } catch (error) {
      res.status(500).send('<h1>Error loading emails</h1>');
    }
  } else {
    // Default: show API info
    res.json({
      message: 'Scedge Waitlist API',
      version: '1.0.0',
      endpoints: {
        'GET /api/waitlist': 'Get all waitlist emails',
        'POST /api/waitlist': 'Add a new email to waitlist',
        'DELETE /api/waitlist': 'Clear all waitlist emails',
        'GET /api/health': 'Health check endpoint',
        'GET /?view=emails': 'View emails in browser (HTML)',
        'POST /api/upload': 'Upload file to cloud storage',
        'GET /api/files/:bucket': 'List files in bucket',
        'DELETE /api/files/:bucket/*': 'Delete file from storage',
        'POST /api/ai/value-proposition': 'Generate AI value proposition',
        'POST /api/ai/analyze': 'Analyze content with AI',
        'POST /api/ai/insights': 'Generate insights from data'
      }
    });
  }
});

// GET all emails
app.get('/api/waitlist', async (req, res) => {
  try {
    const emails = await getEmailsData();
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to load emails' });
  }
});

// POST new email
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (useSupabase) {
      // Use Supabase
      try {
        const newEntry = await db.addEmail(email);
        res.status(201).json(newEntry);
      } catch (error) {
        if (error.message === 'Email already exists') {
          return res.status(409).json({ error: 'Email already exists' });
        }
        throw error;
      }
    } else {
      // Use file storage (fallback)
      const emails = loadEmails();
      
      // Check for duplicates
      if (emails.some(e => e.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const newEntry = {
        id: crypto.randomUUID(),
        email: email.trim(),
        timestamp: Date.now(),
      };

      emails.unshift(newEntry); // Add to beginning
      saveEmails(emails);

      res.status(201).json(newEntry);
    }
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

// DELETE all emails
app.delete('/api/waitlist', async (req, res) => {
  try {
    if (useSupabase) {
      await db.clearEmails();
    } else {
      saveEmails([]);
    }
    res.json({ message: 'All emails cleared' });
  } catch (error) {
    console.error('Error clearing emails:', error);
    res.status(500).json({ error: 'Failed to clear emails' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    services: {
      database: useSupabase ? 'Supabase' : 'File storage',
      cloudStorage: storage.isConfigured() ? 'Supabase Storage' : 'Not configured',
      ai: ai.isConfigured() ? 'OpenAI' : 'Not configured'
    }
  });
});

// ==================== Cloud Storage Endpoints ====================

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!storage.isConfigured()) {
      return res.status(503).json({ error: 'Cloud storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' });
    }

    const { bucket = 'uploads', folder = '' } = req.body;
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${req.file.originalname}`;

    const result = await storage.uploadFile(
      bucket,
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({
      success: true,
      path: result.path,
      url: result.url,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// List files in bucket
app.get('/api/files/:bucket', async (req, res) => {
  try {
    if (!storage.isConfigured()) {
      return res.status(503).json({ error: 'Cloud storage not configured' });
    }

    const { bucket } = req.params;
    const { folder = '' } = req.query;

    const files = await storage.listFiles(bucket, folder);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete file
app.delete('/api/files/:bucket/*', async (req, res) => {
  try {
    if (!storage.isConfigured()) {
      return res.status(503).json({ error: 'Cloud storage not configured' });
    }

    const { bucket } = req.params;
    const filePath = req.params[0]; // Everything after /files/:bucket/

    await storage.deleteFile(bucket, filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ==================== AI Processing Endpoints ====================

// Generate value proposition
app.post('/api/ai/value-proposition', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    if (!ai.isConfigured()) {
      return res.status(503).json({ 
        error: 'AI not configured. Set OPENAI_API_KEY environment variable.',
        fallback: `Scedge adapts to your workflow as a ${role}, optimizing resources and predicting bottlenecks before they happen.`
      });
    }

    const result = await ai.generateValueProposition(role);
    res.json({ result });
  } catch (error) {
    console.error('Error generating value proposition:', error);
    res.status(500).json({ error: 'Failed to generate value proposition' });
  }
});

// Analyze content
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { content, analysisType = 'summary' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!ai.isConfigured()) {
      return res.status(503).json({ error: 'AI not configured. Set OPENAI_API_KEY environment variable.' });
    }

    const result = await ai.analyzeContent(content, analysisType);
    res.json({ result, analysisType });
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

// Generate insights
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { data, context = '' } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    if (!ai.isConfigured()) {
      return res.status(503).json({ error: 'AI not configured. Set OPENAI_API_KEY environment variable.' });
    }

    const result = await ai.generateInsights(data, context);
    res.json({ result });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📧 Waitlist API: /api/waitlist`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || '* (all origins)'}`);
  if (useSupabase) {
    console.log(`💾 Database: Supabase`);
  } else {
    console.log(`💾 Database: File storage (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to use Supabase)`);
  }
  if (storage.isConfigured()) {
    console.log(`☁️  Cloud Storage: Supabase Storage`);
  } else {
    console.log(`☁️  Cloud Storage: Not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)`);
  }
  if (ai.isConfigured()) {
    console.log(`🤖 AI Processing: OpenAI`);
  } else {
    console.log(`🤖 AI Processing: Not configured (set OPENAI_API_KEY)`);
  }
});

