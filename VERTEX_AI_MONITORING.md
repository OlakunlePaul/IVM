# Vertex AI Monitoring Guide

**Date:** 2024-12-19  
**Purpose:** Monitor Vertex AI video generation for authentication and API issues

---

## Quick Status Check

### ✅ Environment Variables
All required variables are set in `.env.local`:
- `VERTEX_AI_API_KEY` ✅
- `GOOGLE_CLOUD_PROJECT_ID` ✅
- `GOOGLE_CLOUD_REGION` ✅

### ✅ Endpoint Test
Direct API test passed:
- Endpoint: `https://us-central1-aiplatform.googleapis.com/v1/projects/569295257974/locations/us-central1/publishers/google/models/veo-3.1-generate-preview:predictLongRunning`
- Status: **200 OK** ✅
- Operation ID received: `projects/569295257974/locations/us-central1/publishers/google/models/veo-3.1-generate-preview/operations/12c63a36-bf6b-413e-aed5-7e903b5e6c61`

---

## What to Monitor

### 1. Next.js Server Logs

**Location:** Terminal where `npm run dev` is running

**Look for:**
```
✅ Good Signs:
- "Starting video generation using Vertex AI..."
- "Project: 569295257974, Region: us-central1"
- "Operation created: projects/.../operations/..."
- "Video generation in progress..."
- "Hero video ready! Downloading from: ..."
- "Video saved successfully to: ..."

❌ Error Signs:
- "401 Unauthorized" - API key issue
- "403 Forbidden" - Permission issue
- "404 Not Found" - Endpoint or model issue
- "500 Internal Server Error" - Server-side error
- "Failed to generate access token" - OAuth issue
- "Invalid JSON payload" - Request format issue
```

### 2. Browser Console

**Location:** Browser DevTools (F12) → Console tab

**Look for:**
```
✅ Good Signs:
- No errors related to video generation
- Successful API calls (200 status)
- Video loading/playing successfully

❌ Error Signs:
- Network errors (CORS, 401, 403, 404, 500)
- "Failed to generate video" messages
- Video playback errors
```

### 3. Network Tab

**Location:** Browser DevTools (F12) → Network tab

**Monitor these endpoints:**
- `/api/gemini/generate-and-save` (POST)
- `/api/gemini/poll-video` (GET)
- `/api/gemini/generate-hero-video` (POST)
- `/api/gemini/poll-hero-video` (GET)

**Check:**
- Status codes (should be 200)
- Response times (video generation takes 5-10 minutes)
- Response payloads (should contain `operationId` or `status: 'completed'`)

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Symptoms:**
```
Status: 401
Error: "Request had invalid authentication credentials"
```

**Solutions:**
1. Verify `VERTEX_AI_API_KEY` in `.env.local`
2. Check API key hasn't expired
3. Verify API key has Vertex AI permissions in Google Cloud Console

**Check:**
```bash
# Verify env var is loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.VERTEX_AI_API_KEY?.substring(0,20))"
```

---

### Issue 2: 403 Forbidden

**Symptoms:**
```
Status: 403
Error: "Permission denied" or "API not enabled"
```

**Solutions:**
1. Enable Vertex AI API in Google Cloud Console:
   - Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
   - Click "Enable"
2. Verify service account permissions:
   - Service Account: `569295257974-compute@developer.gserviceaccount.com`
   - Required role: `Vertex AI User` or `Vertex AI Service Agent`
3. Check project billing is enabled

---

### Issue 3: 404 Not Found

**Symptoms:**
```
Status: 404
Error: "Model not found" or "Operation not found"
```

**Solutions:**
1. Verify model name is correct:
   - `veo-3.1-generate-preview` (current)
   - `veo-3.0-generate-001` (alternative)
   - `veo-2.0-generate-001` (alternative)
2. Check operation ID format:
   - Should be: `projects/{project}/locations/{region}/operations/{id}`
   - Not: `models/veo-.../operations/{id}` (old format)
3. Verify project ID and region match:
   - Project: `569295257974`
   - Region: `us-central1`

---

### Issue 4: Operation Timeout

**Symptoms:**
```
Operation status: "RUNNING" for > 15 minutes
No video download after polling
```

**Solutions:**
1. Video generation typically takes 5-10 minutes
2. Check operation status in Google Cloud Console:
   - Go to: https://console.cloud.google.com/vertex-ai/operations
   - Search for operation ID
3. Increase polling timeout if needed (currently 10 minutes)

---

### Issue 5: Video Download Fails

**Symptoms:**
```
"Hero video ready! Downloading from: ..."
"Failed to download hero video: ..."
```

**Solutions:**
1. Verify video URL is accessible
2. Check API key is included in download URL
3. Verify storage permissions for service account
4. Check network connectivity

---

## Testing Commands

### Test Environment Variables
```bash
node test-vertex-ai.js
```

### Test API Routes (requires Next.js server running)
```bash
node test-vertex-ai-api.js
```

### Check Server Logs
```bash
# In terminal where Next.js is running
# Look for Vertex AI related logs
```

---

## Monitoring Checklist

Before deploying or after changes:

- [ ] Environment variables set in `.env.local`
- [ ] Direct API test passes (`test-vertex-ai.js`)
- [ ] Next.js server starts without errors
- [ ] Video generation endpoint responds (200 or 400)
- [ ] Operation ID received after generation request
- [ ] Polling endpoint works with operation ID
- [ ] Video downloads successfully
- [ ] No authentication errors in logs
- [ ] No permission errors in logs

---

## Log Examples

### Successful Video Generation
```
[2024-12-19 10:30:00] Starting video generation using Vertex AI...
[2024-12-19 10:30:00] Project: 569295257974, Region: us-central1
[2024-12-19 10:30:01] Operation created: projects/569295257974/locations/us-central1/publishers/google/models/veo-3.1-generate-preview/operations/abc123
[2024-12-19 10:35:00] Polling operation: abc123
[2024-12-19 10:35:01] Operation status: RUNNING
[2024-12-19 10:40:00] Polling operation: abc123
[2024-12-19 10:40:01] Operation status: DONE
[2024-12-19 10:40:02] Hero video ready! Downloading from: https://...
[2024-12-19 10:40:05] Video saved successfully to: public/videos/hero-fleet-highway.mp4
```

### Authentication Error
```
[2024-12-19 10:30:00] Starting video generation using Vertex AI...
[2024-12-19 10:30:01] Vertex AI API error: 401 Unauthorized
[2024-12-19 10:30:01] Error: Request had invalid authentication credentials
```

### Permission Error
```
[2024-12-19 10:30:00] Starting video generation using Vertex AI...
[2024-12-19 10:30:01] Vertex AI API error: 403 Forbidden
[2024-12-19 10:30:01] Error: Vertex AI API has not been used in project 569295257974 before or it is disabled
```

---

## Support Resources

- **Google Cloud Console:** https://console.cloud.google.com/
- **Vertex AI Documentation:** https://cloud.google.com/vertex-ai/docs
- **Veo 3 Documentation:** https://cloud.google.com/vertex-ai/docs/generative-ai/video/veo-3
- **API Status:** https://status.cloud.google.com/

---

## Last Verified

- **Date:** 2024-12-19
- **Status:** ✅ All tests passing
- **Endpoint:** Working
- **Authentication:** Valid
- **Operation Creation:** Successful

