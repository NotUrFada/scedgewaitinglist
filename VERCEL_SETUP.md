# Quick Vercel Setup

Your backend is deployed at: **https://scedge-backend.onrender.com**

## Set Environment Variable in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project: **scedgewaitinglist**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add this variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://scedge-backend.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

## Verify It's Working

1. After redeploy, visit: https://scedgewaitinglist.vercel.app
2. Open browser console (F12)
3. You should see: `🔗 API Base URL: https://scedge-backend.onrender.com/api`
4. Try submitting an email - it should work!

## Update Backend CORS (Optional)

If you want to restrict CORS to only your Vercel domain:

1. Go to Render dashboard
2. Edit your backend service
3. Add/Update environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://scedgewaitinglist.vercel.app`
4. Redeploy the backend

