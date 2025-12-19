# Gemini & Veo 3 Video Generation Setup Guide

This guide helps you integrate AI-powered video generation using Google's Gemini API and Veo 3 into any Next.js/React project.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [File Structure](#file-structure)
4. [Configuration](#configuration)
5. [API Routes](#api-routes)
6. [React Hooks](#react-hooks)
7. [Usage Examples](#usage-examples)
8. [Customization](#customization)
9. [Troubleshooting](#troubleshooting)

---

## 🔑 Prerequisites

- Next.js 13+ (App Router)
- React 18+
- Google AI Studio account with Veo 3 access
- API key from Google AI Studio

---

## 🚀 Quick Start

### Step 1: Environment Variables

Create `.env.local` in your project root:

```env
GEMINI_API_KEY=your_api_key_here
```

### Step 2: Create Directory Structure

```bash
mkdir -p app/api/gemini
mkdir -p hooks
mkdir -p public/videos
```

### Step 3: Copy Files

Copy all files from the [API Routes](#api-routes) and [React Hooks](#react-hooks) sections below.

### Step 4: Use in Your Components

```tsx
import { useHeroVideo } from '@/hooks/useHeroVideo'

const MyComponent = () => {
  const { videoUrl, exists, generateVideo } = useHeroVideo()
  
  return (
    <video src={videoUrl} autoPlay loop muted />
  )
}
```

---

## 📁 File Structure

```
your-project/
├── .env.local                    # API key configuration
├── app/
│   └── api/
│       └── gemini/
│           ├── generate-and-save/
│           │   └── route.ts      # General video generation
│           ├── generate-hero-video/
│           │   └── route.ts      # Hero video generation
│           ├── poll-video/
│           │   └── route.ts      # Video status polling
│           ├── poll-hero-video/
│           │   └── route.ts      # Hero video polling
│           └── route.ts          # Text generation
├── hooks/
│   ├── useHeroVideo.ts           # Hero video hook
│   └── useSavedVideo.ts          # General video hook
└── public/
    └── videos/                   # Generated videos stored here
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_google_ai_studio_api_key

# Optional (defaults to public/videos/)
VIDEO_STORAGE_PATH=public/videos
```

### Video Prompts

Edit these constants in the API route files:

**For Hero Videos** (`generate-hero-video/route.ts`):
```typescript
const HERO_VIDEO_PROMPT = 'Your custom hero video prompt here'
```

**For General Videos** (`generate-and-save/route.ts`):
```typescript
const VIDEO_PROMPT = 'Your custom video prompt here'
```

---

## 🔌 API Routes

### 1. General Video Generation

**File:** `app/api/gemini/generate-and-save/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const API_KEY = process.env.GEMINI_API_KEY || ''
const VIDEO_PROMPT = 'Your video prompt here' // Customize this
const VIDEO_FILENAME = 'your-video.mp4' // Customize this

export async function POST(request: NextRequest) {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
    }

    const videoPath = path.join(videosDir, VIDEO_FILENAME)
    const videoUrl = `/videos/${VIDEO_FILENAME}`

    if (fs.existsSync(videoPath)) {
      return NextResponse.json({
        status: 'exists',
        videoUrl,
        path: videoPath,
      })
    }

    // List available Veo models
    let availableVeoModels: Array<{name: string, supportedMethods?: string[]}> = []
    try {
      const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
      const modelsResponse = await fetch(listModelsUrl)
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        const veoModels = modelsData.models?.filter((m: any) => m.name?.toLowerCase().includes('veo'))
        if (veoModels && veoModels.length > 0) {
          availableVeoModels = veoModels.map((m: any) => ({
            name: m.name,
            supportedMethods: m.supportedGenerationMethods || []
          }))
        }
      }
    } catch (e) {
      console.log('Could not list models')
    }

    if (availableVeoModels.length === 0) {
      availableVeoModels = [
        { name: 'models/veo-3.0-generate-001', supportedMethods: ['predictLongRunning'] },
        { name: 'models/veo-2.0-generate-001', supportedMethods: ['predictLongRunning'] },
      ]
    }

    // Try Veo 3 API
    let veoResponse
    let veoResponseData
    
    for (const model of availableVeoModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${model.name}:predictLongRunning?key=${API_KEY}`
        
        veoResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{
              prompt: VIDEO_PROMPT,
            }],
          }),
        })

        if (veoResponse.ok) {
          veoResponseData = await veoResponse.json()
          break
        }
      } catch (e) {
        continue
      }
    }

    if (!veoResponse || !veoResponse.ok) {
      return NextResponse.json({
        status: 'error',
        error: 'Video generation not available',
      }, { status: 503 })
    }

    // Handle operation response
    if (veoResponseData?.operation?.name) {
      const operationFile = path.join(videosDir, 'operation-id.json')
      fs.writeFileSync(operationFile, JSON.stringify({
        operationId: veoResponseData.operation.name,
        prompt: VIDEO_PROMPT,
        createdAt: new Date().toISOString(),
        status: 'processing',
      }))

      return NextResponse.json({
        status: 'processing',
        operationId: veoResponseData.operation.name,
        message: 'Video generation in progress',
      })
    }

    return NextResponse.json({
      status: 'error',
      error: 'Unexpected response format',
    }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    const videoPath = path.join(videosDir, VIDEO_FILENAME)
    const videoUrl = `/videos/${VIDEO_FILENAME}`

    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath)
      return NextResponse.json({
        exists: true,
        videoUrl,
        size: stats.size,
        created: stats.birthtime.toISOString(),
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
```

### 2. Video Polling

**File:** `app/api/gemini/poll-video/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const API_KEY = process.env.GEMINI_API_KEY || ''
const VIDEO_FILENAME = 'your-video.mp4' // Must match generate-and-save

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operationId = searchParams.get('operationId')

    if (!operationId) {
      return NextResponse.json({ error: 'operationId required' }, { status: 400 })
    }

    const videosDir = path.join(process.cwd(), 'public', 'videos')
    const videoPath = path.join(videosDir, VIDEO_FILENAME)
    const videoUrl = `/videos/${VIDEO_FILENAME}`

    if (fs.existsSync(videoPath)) {
      return NextResponse.json({
        status: 'completed',
        videoUrl,
      })
    }

    // Poll operation status
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${operationId}?key=${API_KEY}`
    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = await response.json()

      if (data.done && data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri) {
        const videoUri = data.response.generateVideoResponse.generatedSamples[0].video.uri
        const downloadUrl = videoUri.includes('key=') ? videoUri : `${videoUri}${videoUri.includes('?') ? '&' : '?'}key=${API_KEY}`
        
        const videoResponse = await fetch(downloadUrl)
        if (videoResponse.ok) {
          const videoBuffer = await videoResponse.arrayBuffer()
          fs.writeFileSync(videoPath, Buffer.from(videoBuffer))

          const operationFile = path.join(videosDir, 'operation-id.json')
          if (fs.existsSync(operationFile)) {
            fs.unlinkSync(operationFile)
          }

          return NextResponse.json({
            status: 'completed',
            videoUrl,
            size: videoBuffer.byteLength,
          })
        }
      }

      if (data.done && data.error) {
        return NextResponse.json({
          status: 'error',
          error: data.error.message || 'Video generation failed',
        }, { status: 500 })
      }

      return NextResponse.json({
        status: 'processing',
        message: 'Video generation in progress...',
      })
    }

    return NextResponse.json({
      status: 'error',
      error: 'Operation not found',
    }, { status: 404 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
```

### 3. Hero Video Generation

**File:** `app/api/gemini/generate-hero-video/route.ts`

Copy the same structure as `generate-and-save/route.ts` but:
- Change `VIDEO_PROMPT` to `HERO_VIDEO_PROMPT`
- Change `VIDEO_FILENAME` to `hero-video.mp4`
- Update all references accordingly

### 4. Hero Video Polling

**File:** `app/api/gemini/poll-hero-video/route.ts`

Copy the same structure as `poll-video/route.ts` but:
- Change `VIDEO_FILENAME` to `hero-video.mp4`
- Update operation file name to `hero-operation-id.json`

---

## 🎣 React Hooks

### 1. General Video Hook

**File:** `hooks/useSavedVideo.ts`

```typescript
import { useState, useEffect } from 'react'

interface VideoInfo {
  exists: boolean
  videoUrl?: string
  size?: number
  created?: string
  error?: string
}

export const useSavedVideo = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({ exists: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch('/api/gemini/generate-and-save')
        const data: VideoInfo = await response.json()
        setVideoInfo(data)
        setError(data.error || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check video')
        setVideoInfo({ exists: false })
      } finally {
        setLoading(false)
      }
    }
    checkVideo()
  }, [])

  const generateVideo = async () => {
    setLoading(true)
    setError(null)
    setStatus(null)

    try {
      const response = await fetch('/api/gemini/generate-and-save', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to generate video')

      const data = await response.json()

      if (data.status === 'exists' || data.status === 'completed') {
        setVideoInfo({ exists: true, videoUrl: data.videoUrl })
        setStatus(null)
        return data.videoUrl
      }

      if (data.status === 'processing' && data.operationId) {
        let pollCount = 0
        const maxPolls = 20
        
        const pollInterval = setInterval(async () => {
          pollCount++
          try {
            const pollResponse = await fetch(`/api/gemini/poll-video?operationId=${data.operationId}`)
            const pollData = await pollResponse.json()

            if (pollData.status === 'completed' && pollData.videoUrl) {
              clearInterval(pollInterval)
              setVideoInfo({ exists: true, videoUrl: pollData.videoUrl })
              setLoading(false)
              setError(null)
              setStatus(null)
            } else if (pollData.status === 'error') {
              clearInterval(pollInterval)
              setError(pollData.error || 'Video generation failed')
              setStatus(null)
              setLoading(false)
            } else if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setError('Video generation timed out')
              setStatus(null)
              setLoading(false)
            } else {
              setStatus(`Checking progress... (${pollCount}/${maxPolls})`)
            }
          } catch (pollErr) {
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setError('Video generation timed out')
              setStatus(null)
              setLoading(false)
            }
          }
        }, 30000) // Poll every 30 seconds

        setStatus('Video generation in progress. This may take several minutes...')
        return null
      }

      if (data.status === 'error') {
        setError(data.message || data.error || 'Video generation failed')
        return null
      }

      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    videoUrl: videoInfo.videoUrl,
    exists: videoInfo.exists,
    loading,
    error,
    status,
    generateVideo,
  }
}
```

### 2. Hero Video Hook

**File:** `hooks/useHeroVideo.ts`

Copy the same structure as `useSavedVideo.ts` but:
- Change all API endpoints to `/api/gemini/generate-hero-video` and `/api/gemini/poll-hero-video`
- Update variable names to `heroVideoUrl`, `heroVideoExists`, etc.

---

## 💡 Usage Examples

### Example 1: Simple Video Display

```tsx
'use client'

import { useSavedVideo } from '@/hooks/useSavedVideo'

export default function VideoSection() {
  const { videoUrl, exists, loading, generateVideo } = useSavedVideo()

  if (loading) return <div>Loading...</div>
  if (!exists) {
    return (
      <div>
        <button onClick={generateVideo}>Generate Video</button>
      </div>
    )
  }

  return (
    <video 
      src={videoUrl} 
      autoPlay 
      loop 
      muted 
      className="w-full h-full object-cover"
    />
  )
}
```

### Example 2: Hero Section with Video Background

```tsx
'use client'

import { useHeroVideo } from '@/hooks/useHeroVideo'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { videoUrl, exists, generateVideo } = useHeroVideo()

  useEffect(() => {
    if (!exists) {
      generateVideo()
    }
  }, [exists, generateVideo])

  useEffect(() => {
    if (videoRef.current && videoUrl && exists) {
      videoRef.current.play()
    }
  }, [videoUrl, exists])

  return (
    <section className="relative h-screen">
      {exists && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}
      <div className="relative z-10">
        {/* Your hero content */}
      </div>
    </section>
  )
}
```

### Example 3: Video with Loading States

```tsx
'use client'

import { useSavedVideo } from '@/hooks/useSavedVideo'

export default function VideoPlayer() {
  const { videoUrl, exists, loading, error, status, generateVideo } = useSavedVideo()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={generateVideo}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>
    )
  }

  if (!exists) {
    return (
      <div className="flex items-center justify-center h-64">
        <button 
          onClick={generateVideo}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Generate Video
        </button>
      </div>
    )
  }

  return (
    <video 
      src={videoUrl} 
      controls
      className="w-full rounded-lg"
      autoPlay
      loop
    />
  )
}
```

---

## 🎨 Customization

### Custom Video Prompts

Edit the `VIDEO_PROMPT` constant in your API route:

```typescript
const VIDEO_PROMPT = `
A cinematic video of [your subject] on [location] during [time of day].
[Additional details about style, mood, camera movement, etc.]
`
```

### Custom Video Filenames

Change the `VIDEO_FILENAME` constant:

```typescript
const VIDEO_FILENAME = 'my-custom-video.mp4'
```

### Custom Storage Path

Modify the videos directory:

```typescript
const videosDir = path.join(process.cwd(), 'public', 'custom-folder')
```

### Polling Interval

Adjust polling frequency in the hook:

```typescript
}, 30000) // Change 30000 to your desired interval in milliseconds
```

---

## 🔧 Troubleshooting

### Issue: "models/veo-X.X-generate-001 is not found"

**Solution:** Ensure your Google AI Studio account has Veo 3 access. The API will automatically try different models.

### Issue: "Operation not found" during polling

**Solution:** Check that the operation ID format matches. The API handles different formats automatically.

### Issue: Video not downloading

**Solution:** 
1. Check API key is correct
2. Verify video URI is accessible
3. Check network requests in browser console

### Issue: "Failed to parse JSON"

**Solution:** The API handles HTML error pages. Check the actual error in the response.

### Issue: Video generation times out

**Solution:** Increase `maxPolls` in the hook or check operation status manually.

---

## 📝 Notes

- Videos are saved to `public/videos/` by default
- Operation IDs are stored in JSON files for recovery
- The system automatically detects available Veo models
- Falls back gracefully if API is unavailable
- Polls every 30 seconds by default (configurable)

---

## 🚀 Quick Copy Checklist

- [ ] Create `.env.local` with `GEMINI_API_KEY`
- [ ] Create `app/api/gemini/` directory
- [ ] Create `hooks/` directory
- [ ] Create `public/videos/` directory
- [ ] Copy API route files
- [ ] Copy hook files
- [ ] Customize video prompts
- [ ] Customize video filenames
- [ ] Import and use hooks in components
- [ ] Test video generation

---

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Veo 3 Information](https://deepmind.google/technologies/veo/)

---

**Last Updated:** 2024
**Version:** 1.0.0

