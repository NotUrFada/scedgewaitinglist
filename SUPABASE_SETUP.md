# Supabase Setup Guide

This guide will help you set up Supabase for permanent email storage.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account (or sign in)
3. Click "New Project"

## Step 2: Create a New Project

1. **Project Name**: `scedge-waitlist` (or any name you like)
2. **Database Password**: Create a strong password (save it somewhere safe)
3. **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be created

## Step 3: Create the Database Table

1. In your Supabase dashboard, go to **Table Editor** (left sidebar)
2. Click **"New table"**
3. Configure the table:
   - **Name**: `waitlist`
   - **Description**: "Waitlist email entries"
4. Add columns:
   - **Column 1**:
     - Name: `id`
     - Type: `uuid`
     - Default value: `gen_random_uuid()`
     - Is Primary Key: ✅ Yes
     - Is Nullable: ❌ No
   - **Column 2**:
     - Name: `email`
     - Type: `text`
     - Is Nullable: ❌ No
     - Unique: ✅ Yes (click the "Unique" toggle)
   - **Column 3**:
     - Name: `created_at`
     - Type: `timestamptz`
     - Default value: `now()`
     - Is Nullable: ❌ No
5. Click **"Save"**

## Step 4: Get Your API Keys

1. Go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Service Role Key** (starts with `eyJ...` - this is secret, don't share it!)

## Step 5: Set Environment Variables in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `scedge-backend` service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add these two variables:

   **Variable 1:**
   - Key: `SUPABASE_URL`
   - Value: Your Project URL from Step 4 (e.g., `https://xxxxx.supabase.co`)

   **Variable 2:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your Service Role Key from Step 4 (the long `eyJ...` string)

6. Click **"Save Changes"**

## Step 6: Redeploy Your Backend

1. In Render, go to **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete (1-2 minutes)
3. Check the logs - you should see: `✅ Using Supabase database`

## Step 7: Verify It's Working

1. Visit your frontend: https://scedgewaitinglist.vercel.app
2. Submit a test email
3. Go to your Supabase dashboard → **Table Editor** → `waitlist` table
4. You should see your email appear in the table!

## Viewing Emails in Supabase

You can view all emails directly in Supabase:
1. Go to your Supabase dashboard
2. Click **Table Editor** → `waitlist`
3. You'll see all emails with timestamps
4. You can also export data, filter, and search

## Benefits of Supabase

✅ **Permanent storage** - Emails won't be lost  
✅ **Easy viewing** - View emails in Supabase dashboard  
✅ **Scalable** - Handles thousands of emails  
✅ **Free tier** - 500MB database, 2GB bandwidth  
✅ **Export data** - Easy CSV/JSON export  
✅ **Backups** - Automatic daily backups

## Troubleshooting

**"Supabase not configured" error:**
- Make sure you set both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render
- Redeploy after setting environment variables

**Emails not appearing:**
- Check Render logs for errors
- Verify the table name is exactly `waitlist` (lowercase)
- Make sure columns are named: `id`, `email`, `created_at`

**Still using file storage:**
- Check that environment variables are set correctly in Render
- Restart/redeploy the service
- Check logs for: `✅ Using Supabase database`

