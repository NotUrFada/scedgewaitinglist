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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Scedge Waitlist API',
    version: '1.0.0',
    endpoints: {
      'GET /api/waitlist': 'Get all waitlist emails',
      'POST /api/waitlist': 'Add a new email to waitlist',
      'DELETE /api/waitlist': 'Clear all waitlist emails',
      'GET /api/health': 'Health check endpoint'
    }
  });
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

