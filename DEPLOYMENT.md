# Deployment Guide

This guide will help you deploy your Scedge waitlist app to production.

## Architecture

- **Frontend**: Deployed on Vercel (React + Vite)
- **Backend**: Deployed on Render (Node.js + Express)

## Step 1: Deploy Backend to Render

1. **Create a Render account** at [render.com](https://render.com) (free tier available)

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Or use "Public Git repository" and paste your repo URL

3. **Configure the service**:
   - **Name**: `scedge-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

4. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Leave empty for now (we'll update after frontend deployment)

5. **Deploy**: Click "Create Web Service"

6. **Copy your backend URL**: It will look like `https://scedge-backend.onrender.com`

## Step 2: Deploy Frontend to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com) (free tier available)

2. **Import your project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Or use "Deploy" with your Git provider

3. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Set Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
     (Replace with your actual Render backend URL from Step 1)

5. **Deploy**: Click "Deploy"

6. **Copy your frontend URL**: It will look like `https://scedge.vercel.app`

## Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Edit your backend service
3. Update the `FRONTEND_URL` environment variable to your Vercel frontend URL
4. Redeploy the service

## Step 4: Verify Deployment

1. Visit your Vercel frontend URL
2. Submit a test email
3. Open the Admin Panel (lock icon in footer)
4. Verify the email appears in the list

## Accessing Your Emails

- **Via Admin Panel**: Click the lock icon (🔒) in the footer of your deployed site
- **Via API**: `GET https://your-backend-url.onrender.com/api/waitlist`
- **Export CSV**: Use the "Export CSV" button in the Admin Panel

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check that `VITE_API_URL` in Vercel points to your Render backend

### Backend Not Responding
- Check Render logs for errors
- Verify the start command is `node server.js`
- Ensure `PORT` environment variable is set (Render sets this automatically)

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check browser console for API errors
- Ensure backend is deployed and running (check Render dashboard)

## Data Persistence

Emails are stored in `waitlist-data.json` on Render's filesystem. This persists across deployments but may be lost if you delete the service.

For production use, consider migrating to a database (PostgreSQL, MongoDB, etc.) for better reliability.

