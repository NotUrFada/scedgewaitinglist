import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, 'waitlist-data.json');

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

// Root route - show API info or simple email viewer
app.get('/', (req, res) => {
  // If query parameter ?view=emails, show HTML viewer
  if (req.query.view === 'emails') {
    try {
      const emails = loadEmails();
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
        'GET /?view=emails': 'View emails in browser (HTML)'
      }
    });
  }
});

// GET all emails
app.get('/api/waitlist', (req, res) => {
  try {
    const emails = loadEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load emails' });
  }
});

// POST new email
app.post('/api/waitlist', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

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
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

// DELETE all emails
app.delete('/api/waitlist', (req, res) => {
  try {
    saveEmails([]);
    res.json({ message: 'All emails cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear emails' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📧 Waitlist API: /api/waitlist`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || '* (all origins)'}`);
});

