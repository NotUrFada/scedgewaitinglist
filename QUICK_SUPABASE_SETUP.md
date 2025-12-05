# Quick Supabase Setup (5 minutes)

## Step 1: Create Supabase Project (2 min)

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `scedge-waitlist`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

## Step 2: Create Database Table (1 min)

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy and paste the entire contents of `supabase-setup.sql` file
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see: "Success. No rows returned"

## Step 3: Get API Keys (1 min)

1. Click **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role key** (the long string starting with `eyJ...`)

## Step 4: Add to Render (1 min)

1. Go to: https://dashboard.render.com
2. Click your `scedge-backend` service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add these two:

   **First variable:**
   - Key: `SUPABASE_URL`
   - Value: Paste your Project URL

   **Second variable:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Paste your service_role key

6. Click **"Save Changes"**

## Step 5: Redeploy

1. In Render, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 1-2 minutes
3. Check logs - should see: `✅ Using Supabase database`

## Done! 🎉

Your emails are now stored permanently in Supabase!

**View emails:**
- Supabase Dashboard → Table Editor → `waitlist` table
- Or use your Admin Panel (lock icon on your site)

