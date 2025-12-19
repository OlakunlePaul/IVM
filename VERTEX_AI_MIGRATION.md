# Vertex AI Migration Guide

**Date:** 2024-12-19  
**Status:** ✅ **COMPLETED**

---

## Overview

The Veo 3 video generation implementation has been migrated from Generative AI API to Vertex AI API for better future compatibility and stability.

---

## Changes Made

### 1. Environment Variables

**New Required Variables:**
```env
VERTEX_AI_API_KEY=AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw
GOOGLE_CLOUD_PROJECT_ID=569295257974
GOOGLE_CLOUD_REGION=us-central1
```

**Existing Variable (Still Used for Script Generation):**
```env
GEMINI_API_KEY=your_gemini_api_key
```

---

### 2. Updated Files

#### `app/api/gemini/generate-and-save/route.ts`
- ✅ Switched from `generativelanguage.googleapis.com` to `{region}-aiplatform.googleapis.com`
- ✅ Updated endpoint format to Vertex AI: `projects/{project}/locations/{region}/publishers/google/models/{model}:predictLongRunning`
- ✅ Updated operation handling for Vertex AI format
- ✅ Updated video download to use Vertex AI API key

#### `app/api/gemini/generate-hero-video/route.ts`
- ✅ Switched to Vertex AI endpoints
- ✅ Updated operation handling
- ✅ Updated video download

#### `app/api/gemini/poll-video/route.ts`
- ✅ Updated to use Vertex AI operations API
- ✅ Handles Vertex AI operation ID format: `projects/{project}/locations/{region}/operations/{operationId}`
- ✅ Updated video download authentication

#### `app/api/gemini/poll-hero-video/route.ts`
- ✅ Updated to use Vertex AI operations API
- ✅ Handles Vertex AI operation ID format
- ✅ Updated video download authentication

---

## API Endpoint Changes

### Before (Generative AI API):
```
https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning?key={API_KEY}
```

### After (Vertex AI):
```
https://us-central1-aiplatform.googleapis.com/v1/projects/569295257974/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning?key={VERTEX_AI_API_KEY}
```

---

## Operation ID Format

### Before:
```
models/veo-2.0-generate-001/operations/paxhdz7ymp7h
```

### After:
```
projects/569295257974/locations/us-central1/operations/{operationId}
```

---

## Configuration

### Project Details:
- **Project ID:** `569295257974` (extracted from service account)
- **Region:** `us-central1` (default, configurable)
- **Service Account:** `569295257974-compute@developer.gserviceaccount.com`
- **API Key:** `AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw`

---

## Testing

To test the Vertex AI implementation:

1. **Set Environment Variables:**
   ```bash
   VERTEX_AI_API_KEY=AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw
   GOOGLE_CLOUD_PROJECT_ID=569295257974
   GOOGLE_CLOUD_REGION=us-central1
   ```

2. **Test Video Generation:**
   - Make POST request to `/api/gemini/generate-and-save`
   - Check for operation ID in response
   - Poll using `/api/gemini/poll-video?operationId={operationId}`

3. **Expected Behavior:**
   - Operation created with Vertex AI format
   - Polling uses Vertex AI operations API
   - Video downloaded and saved when complete

---

## Benefits

1. ✅ **Future-Proof:** Vertex AI is the recommended path for Veo 3
2. ✅ **Better Access Control:** Uses Google Cloud project-based authentication
3. ✅ **More Stable:** Less likely to change API access policies
4. ✅ **Production Ready:** Suitable for enterprise deployments

---

## Notes

- Script generation still uses Generative AI API (Gemini) - this is correct
- Video generation now uses Vertex AI API exclusively
- Operation IDs are stored with project/region info for proper polling
- All video downloads use Vertex AI API key for authentication

---

## Migration Complete

All Veo 3 video generation endpoints have been successfully migrated to Vertex AI API.

