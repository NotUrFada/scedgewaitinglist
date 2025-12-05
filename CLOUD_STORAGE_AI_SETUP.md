# Cloud Storage & AI Processing Setup

Your app now supports:
- ☁️ **Cloud Storage** (Supabase Storage) - Upload and store files
- 🤖 **AI Processing** (OpenAI) - Generate content, analyze data, create insights

## Part 1: Cloud Storage Setup (Supabase Storage)

### Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase dashboard
2. Click **Storage** (left sidebar)
3. Click **"New bucket"**
4. Configure:
   - **Name**: `uploads` (or any name you prefer)
   - **Public bucket**: ✅ Yes (if you want public URLs)
   - **File size limit**: 10MB (or adjust as needed)
   - **Allowed MIME types**: Leave empty for all types, or specify (e.g., `image/*,application/pdf`)
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies (Optional but Recommended)

1. In Supabase, go to **Storage** → Your bucket → **Policies**
2. Click **"New Policy"**
3. Create a policy for uploads:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: INSERT
   - **Policy definition**: 
     ```sql
     (bucket_id = 'uploads')
     ```
4. Create a policy for reads:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: SELECT
   - **Policy definition**:
     ```sql
     (bucket_id = 'uploads')
     ```

**Note**: Since you're using the service_role key on the backend, these policies are optional. The service_role key bypasses RLS.

### Step 3: Environment Variables (Already Set!)

You already have these set in Render:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

Cloud storage will work automatically once the bucket is created!

## Part 2: AI Processing Setup (OpenAI)

### Step 1: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** (left sidebar)
4. Click **"Create new secret key"**
5. Name it: `scedge-app`
6. Copy the key (starts with `sk-...`)
   - ⚠️ **Save it now** - you won't see it again!

### Step 2: Add to Render

1. Go to Render dashboard: https://dashboard.render.com
2. Click your `scedge-backend` service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (the `sk-...` string)
6. Click **"Save Changes"**

### Step 3: Redeploy

1. In Render, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 1-2 minutes
3. Check logs - should see: `🤖 AI Processing: OpenAI`

## API Endpoints

### Cloud Storage

**Upload File:**
```bash
POST /api/upload
Content-Type: multipart/form-data

Form data:
- file: (file)
- bucket: "uploads" (optional, defaults to "uploads")
- folder: "images" (optional, for organizing files)
```

**List Files:**
```bash
GET /api/files/:bucket?folder=images
```

**Delete File:**
```bash
DELETE /api/files/:bucket/path/to/file.jpg
```

### AI Processing

**Generate Value Proposition:**
```bash
POST /api/ai/value-proposition
Content-Type: application/json

{
  "role": "Product Manager"
}
```

**Analyze Content:**
```bash
POST /api/ai/analyze
Content-Type: application/json

{
  "content": "Your text here...",
  "analysisType": "summary" // or "sentiment" or "keyPoints"
}
```

**Generate Insights:**
```bash
POST /api/ai/insights
Content-Type: application/json

{
  "data": { "emails": 150, "growth": "20%" },
  "context": "Waitlist growth metrics"
}
```

## Testing

### Test Cloud Storage

1. Use Postman, curl, or your frontend:
```bash
curl -X POST https://your-backend.onrender.com/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "bucket=uploads"
```

### Test AI

1. Visit: `https://your-backend.onrender.com/api/health`
2. Should show AI status
3. Test endpoint:
```bash
curl -X POST https://your-backend.onrender.com/api/ai/value-proposition \
  -H "Content-Type: application/json" \
  -d '{"role": "Developer"}'
```

## Pricing

### Supabase Storage (Free Tier)
- ✅ 1GB storage
- ✅ 2GB bandwidth/month
- ✅ Unlimited files

### OpenAI (Pay-as-you-go)
- ✅ $0.15 per 1M input tokens
- ✅ $0.60 per 1M output tokens
- ✅ GPT-4o-mini is very affordable
- 💡 Typical cost: $0.01-0.10 per 1000 requests

## Security Notes

- ✅ Service role key is server-side only (never exposed to frontend)
- ✅ File uploads are validated (size limits, MIME types)
- ✅ AI API key is server-side only
- ✅ CORS is configured for your domains

## Troubleshooting

**Storage not working:**
- Verify bucket exists in Supabase
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check Render logs for errors

**AI not working:**
- Verify `OPENAI_API_KEY` is set in Render
- Check you have credits in OpenAI account
- Check Render logs for API errors

**File upload fails:**
- Check file size (10MB limit)
- Verify bucket name matches
- Check Supabase Storage policies

