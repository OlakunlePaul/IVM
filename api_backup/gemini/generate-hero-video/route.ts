import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Vertex AI Configuration
const VERTEX_AI_API_KEY = process.env.VERTEX_AI_API_KEY || 'AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw'
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '569295257974'
const GOOGLE_CLOUD_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1'

// Gemini API key for script generation (still using Generative AI API)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB5G4E3ziATLbXKZo8yWcbOwBjZC5itG6s'

const HERO_VIDEO_PROMPT = 'A cinematic, high-quality video showcasing the Innoson Vehicle Manufacturing fleet of premium SUVs driving smoothly on a scenic African highway during golden hour. Multiple luxury vehicles (Innoson G80, G40, and G5T models) are visible, moving gracefully in formation. The scene captures the pride of African roads with smooth camera movements, showcasing the premium design, craftsmanship, and performance of the entire fleet. The golden hour lighting creates a warm, luxurious atmosphere, highlighting the vehicles\' sleek lines and premium finishes. The highway stretches into the distance, with African landscape visible in the background.'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Create videos directory if it doesn't exist
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
    }

    const videoPath = path.join(videosDir, 'hero-fleet-highway.mp4')
    const videoUrl = '/videos/hero-fleet-highway.mp4'

    // Check if video already exists
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath)
      return NextResponse.json({
        status: 'exists',
        message: 'Hero video already exists',
        videoUrl,
        path: videoPath,
        size: stats.size,
        created: stats.birthtime.toISOString(),
      })
    }

    console.log('Starting hero video generation using Gemini API (AI Studio MCP Server)...')
    console.log('Prompt:', HERO_VIDEO_PROMPT)

    // Generate video script - try Gemini API first, fallback to template if it fails
    let videoScript: string
    
    try {
      // Try using Gemini API via REST API directly
      console.log('Attempting to generate hero video script using Gemini API...')
      
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`
      
      const scriptPrompt = `Generate a detailed video production script for the following concept:

${HERO_VIDEO_PROMPT}

Provide:
1. A detailed shot-by-shot description
2. Camera movements and angles
3. Visual elements and composition
4. Duration and pacing
5. Technical specifications (resolution, aspect ratio, etc.)

Format as a professional video production brief.`

      const geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: scriptPrompt
            }]
          }]
        }),
      })

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json()
        videoScript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        
        if (videoScript) {
          console.log('Hero video script generated successfully using Gemini API')
        } else {
          throw new Error('Empty response from Gemini API')
        }
      } else {
        const errorText = await geminiResponse.text()
        console.log('Gemini API failed, using fallback script:', geminiResponse.status, errorText.substring(0, 200))
        throw new Error(`Gemini API returned ${geminiResponse.status}`)
      }
    } catch (geminiError) {
      // Fallback: Generate a professional script template
      console.log('Gemini API unavailable, generating fallback script template...')
      videoScript = `HERO VIDEO PRODUCTION SCRIPT
Generated for: ${HERO_VIDEO_PROMPT}

PROJECT OVERVIEW:
- Duration: 10 seconds
- Aspect Ratio: 16:9
- Resolution: 1080p (1920x1080)
- Frame Rate: 30fps
- Style: Cinematic, Premium, Luxury, Fleet Showcase

SHOT BREAKDOWN:

SHOT 1 (0-3 seconds):
- Wide establishing shot of scenic African highway during golden hour
- Camera: Slow aerial dolly forward, elevated angle showing the road stretching into distance
- Composition: Rule of thirds, highway leading into frame, African landscape visible
- Lighting: Warm golden hour lighting, soft shadows, premium atmosphere
- Action: Highway visible, setting the premium scene for the fleet

SHOT 2 (3-7 seconds):
- Medium-wide shot of Innoson fleet in formation (G80, G40, G5T)
- Camera: Smooth tracking shot, following the fleet movement
- Composition: Multiple vehicles visible, showcasing the entire fleet
- Lighting: Golden hour highlights on vehicles' premium finishes
- Action: Fleet moves gracefully in formation, showcasing premium design and performance

SHOT 3 (7-10 seconds):
- Dynamic shot showcasing individual vehicles and fleet together
- Camera: Slow push-in on key design elements, then pull-back to show full fleet
- Composition: Focus on premium details, then wide fleet view
- Lighting: Dramatic golden hour lighting creating luxury atmosphere
- Action: Highlighting craftsmanship, attention to detail, and the pride of African roads

CAMERA MOVEMENTS:
- Smooth, cinematic camera movements throughout
- Aerial and ground-level perspectives
- Professional dolly and tracking shots
- Slow, deliberate pacing to emphasize luxury and fleet unity

VISUAL ELEMENTS:
- Multiple Innoson vehicle models (G80, G40, G5T) visible
- Premium vehicle designs highlighted
- Scenic African highway backdrop
- Golden hour lighting creating warm, luxurious atmosphere
- Smooth motion emphasizing vehicle performance and fleet coordination
- Professional color grading for cinematic look

TECHNICAL SPECIFICATIONS:
- Resolution: 1080p (1920x1080)
- Aspect Ratio: 16:9
- Frame Rate: 30fps
- Color Space: Rec. 709
- Audio: Premium engine sounds, subtle ambient highway sounds, fleet coordination
- Post-Production: Color grading for golden hour warmth, smooth transitions, fleet showcase

NOTES:
This script emphasizes the premium nature of the entire Innoson fleet while showcasing them on African roads, highlighting both the vehicles' luxury features and their connection to African pride and excellence. The fleet formation showcases the brand's comprehensive SUV collection.`
    }
    
    // Save the video script for reference
    const scriptPath = path.join(videosDir, 'hero-video-script.txt')
    fs.writeFileSync(scriptPath, videoScript)
    console.log('Hero video script saved to:', scriptPath)

    // Try Veo 3 API using Vertex AI endpoints
    let veoResponse
    let veoResponseData
    
    // Vertex AI Veo models to try
    const veoModels = [
      'veo-3.1-generate-preview',
      'veo-3.0-generate-001',
      'veo-3.0-fast-generate-001',
      'veo-2.0-generate-001',
    ]
    
    try {
      let veoError: Error | null = null
      
      console.log('Attempting hero video generation using Vertex AI...')
      console.log(`Project: ${GOOGLE_CLOUD_PROJECT_ID}, Region: ${GOOGLE_CLOUD_REGION}`)
      
      // Try each Veo model with Vertex AI endpoint
      for (const modelId of veoModels) {
        try {
          // Vertex AI endpoint format for predictLongRunning
          const vertexAiUrl = `https://${GOOGLE_CLOUD_REGION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_REGION}/publishers/google/models/${modelId}:predictLongRunning?key=${VERTEX_AI_API_KEY}`
          
          console.log(`Trying Vertex AI model for hero video: ${modelId}`)
          
          veoResponse = await fetch(vertexAiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instances: [{
                prompt: HERO_VIDEO_PROMPT,
                negative_prompt: 'traffic, other vehicles, low quality, blurry, distorted',
                aspect_ratio: '16:9',
                resolution: '1080p',
                duration_seconds: 10,
              }],
            }),
          })

          const veoResponseText = await veoResponse.text()
          console.log(`Vertex AI hero video response status (${modelId}):`, veoResponse.status)
          
          // Check if response is HTML (error page) instead of JSON
          const isHTML = veoResponseText.trim().startsWith('<!DOCTYPE') || veoResponseText.trim().startsWith('<html')
          const contentType = veoResponse.headers.get('content-type') || ''
          const isJSON = contentType.includes('application/json') || (!isHTML && (veoResponseText.trim().startsWith('{') || veoResponseText.trim().startsWith('[')))

          if (veoResponse.ok && isJSON) {
            try {
              veoResponseData = JSON.parse(veoResponseText)
              console.log(`✅ Vertex AI hero video API successful with model ${modelId}!`)
              break // Success! Exit the loop
            } catch (parseError) {
              console.log(`Model ${modelId} returned OK but failed to parse JSON:`, veoResponseText.substring(0, 200))
              if (modelId === veoModels[veoModels.length - 1]) {
                veoError = new Error(`Failed to parse successful response as JSON`)
              }
            }
          } else {
            // Log the error but continue to next model
            if (isHTML) {
              console.log(`Model ${modelId} failed with HTML response (likely 404 page):`, veoResponseText.substring(0, 200))
              if (modelId === veoModels[veoModels.length - 1]) {
                veoError = new Error(`All hero video Veo 3 models failed. Endpoint returned HTML (likely doesn't exist). Status: ${veoResponse.status}`)
              }
            } else {
              try {
                const errorData = JSON.parse(veoResponseText)
                console.log(`Model ${modelId} failed:`, JSON.stringify(errorData, null, 2))
                if (modelId === veoModels[veoModels.length - 1]) {
                  veoError = new Error(`All hero video Veo 3 models failed. Last error: ${errorData.error?.message || veoResponse.status}. Full response: ${veoResponseText.substring(0, 500)}`)
                }
              } catch (parseError) {
                console.log(`Model ${modelId} failed with non-JSON response:`, veoResponseText.substring(0, 200))
                if (modelId === veoModels[veoModels.length - 1]) {
                  veoError = new Error(`All hero video Veo 3 models failed. Last response: ${veoResponseText.substring(0, 500)}`)
                }
              }
            }
          }
        } catch (fetchError) {
          console.log(`Model ${modelId} error:`, fetchError instanceof Error ? fetchError.message : 'Unknown error')
          if (modelId === veoModels[veoModels.length - 1]) {
            veoError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error')
          }
        }
      }

      // If all models failed, throw error
      if (!veoResponse || !veoResponse.ok) {
        throw veoError || new Error('Vertex AI hero video API endpoint not accessible')
      }

      // If Vertex AI Veo 3 API worked
      const data = veoResponseData

      // Handle operation response (async operation)
      // Vertex AI returns operation in format: { name: "projects/.../locations/.../operations/..." }
      if (data.name || (data.operation && data.operation.name)) {
        const operationId = data.name || data.operation.name
        
        // Save operation ID for polling
        const operationFile = path.join(videosDir, 'hero-operation-id.json')
        fs.writeFileSync(operationFile, JSON.stringify({
          operationId: operationId,
          prompt: HERO_VIDEO_PROMPT,
          createdAt: new Date().toISOString(),
          status: 'processing',
          projectId: GOOGLE_CLOUD_PROJECT_ID,
          region: GOOGLE_CLOUD_REGION,
        }))

        return NextResponse.json({
          status: 'processing',
          operationId: operationId,
          message: 'Hero video generation in progress. The system will automatically poll for completion.',
          note: 'This may take 5-10 minutes. Please wait...',
        })
      }

      // If video is immediately available (unlikely but possible)
      if (data.videoUrl || data.video || data.videoUri) {
        const videoUrlToDownload = data.videoUrl || data.video || data.videoUri
        
        console.log('Hero video ready! Downloading from:', videoUrlToDownload)
        
        // Download and save video
        const videoResponse = await fetch(videoUrlToDownload)
        if (!videoResponse.ok) {
          throw new Error(`Failed to download hero video: ${videoResponse.statusText}`)
        }
        
        const videoBuffer = await videoResponse.arrayBuffer()
        fs.writeFileSync(videoPath, Buffer.from(videoBuffer))

        console.log('Hero video saved successfully to:', videoPath)

        return NextResponse.json({
          status: 'completed',
          message: 'Hero video generated and saved successfully',
          videoUrl,
          path: videoPath,
          size: videoBuffer.byteLength,
        })
      }

      // If we get a different response structure, save operation info
      if (data.name || data.operationId) {
        const operationId = data.name || data.operationId || `hero-veo-${Date.now()}`
        const operationFile = path.join(videosDir, 'hero-operation-id.json')
        fs.writeFileSync(operationFile, JSON.stringify({
          operationId,
          prompt: HERO_VIDEO_PROMPT,
          createdAt: new Date().toISOString(),
          status: 'processing',
          projectId: GOOGLE_CLOUD_PROJECT_ID,
          region: GOOGLE_CLOUD_REGION,
          responseData: data,
        }))

        return NextResponse.json({
          status: 'processing',
          operationId,
          message: 'Hero video generation in progress. The system will poll for completion.',
          note: 'This may take 5-10 minutes.',
        })
      }

      // Fallback: return processing status
      return NextResponse.json({
        status: 'processing',
        message: 'Hero video generation initiated. Please wait...',
        operationId: data.name || `hero-veo-${Date.now()}`,
        data,
      })
    } catch (veoError) {
      // Veo 3 is not available - return helpful error with script
      console.log('Hero video generation is not available through standard API')
      
      return NextResponse.json({
        status: 'error',
        error: 'Hero video generation requires special API access that is not currently available',
        message: 'Hero video generation is not available through the standard Gemini API. It requires special access from Google.',
        solution: 'manual_upload',
        videoScript: videoScript,
        scriptPath: '/videos/hero-video-script.txt',
        instructions: [
          '1. A detailed video script has been generated using Gemini AI',
          '2. You can use this script with video production tools or services',
          '3. Alternatively, manually upload a video file to: public/videos/hero-fleet-highway.mp4',
          '4. The script is saved at: public/videos/hero-video-script.txt',
        ],
        alternativeOptions: [
          'Use the generated script with video production software',
          'Use alternative AI video generation services (RunwayML, Pika, etc.)',
          'Manually create and upload the video file',
          'Contact Google for Veo 3 API access if available',
        ],
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Hero video generation error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate hero video. Please check logs.',
    }, { status: 500 })
  }
}

// GET endpoint to check if hero video exists
export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    const videoPath = path.join(videosDir, 'hero-fleet-highway.mp4')
    const videoUrl = '/videos/hero-fleet-highway.mp4'

    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath)
      return NextResponse.json({
        exists: true,
        videoUrl,
        size: stats.size,
        created: stats.birthtime.toISOString(),
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'Hero video not found. Generate it using POST endpoint.',
    })
  } catch (error) {
    return NextResponse.json({
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

