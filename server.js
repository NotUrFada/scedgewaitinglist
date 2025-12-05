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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in production, or specify your frontend URL
  credentials: true
}));
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
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Waitlist API: http://localhost:${PORT}/api/waitlist`);
});

