<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Scedge - Waitlist App

A beautiful waitlist landing page with email collection and admin panel.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run both frontend and backend:
   ```bash
   npm run dev:all
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

3. Access the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Summary:**
- **Frontend**: Deploy to Vercel (free)
- **Backend**: Deploy to Render (free)
- Set `VITE_API_URL` environment variable in Vercel to your Render backend URL

## Features

- ✨ Beautiful 3D animated background
- 📧 Email waitlist collection
- 🔒 Admin panel to view all collected emails
- 📊 Export emails as CSV
- 🚀 Production-ready backend API
