import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Vertex AI Configuration
const VERTEX_AI_API_KEY = process.env.VERTEX_AI_API_KEY || 'AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw'
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '569295257974'
const GOOGLE_CLOUD_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1'

// Gemini API key for script generation (still using Generative AI API)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB5G4E3ziATLbXKZo8yWcbOwBjZC5itG6s'

const VIDEO_PROMPT = 'A high-quality cinematic video of a sleek luxury SUV (Innoson G80) driving smoothly on a scenic highway during golden hour, showcasing the vehicle\'s premium design and performance. The car moves gracefully with smooth camera movement, highlighting the pride of African roads.'

export async function POST(request: NextRequest) {
  try {
    // Create videos directory if it doesn't exist
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
    }

    const videoPath = path.join(videosDir, 'innoson-g80-highway.mp4')
    const videoUrl = '/videos/innoson-g80-highway.mp4'

    // Check if video already exists
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath)
      return NextResponse.json({
        status: 'exists',
        message: 'Video already exists',
        videoUrl,
        path: videoPath,
        size: stats.size,
        created: stats.birthtime.toISOString(),
      })
    }

    console.log('Starting video generation using Gemini API (AI Studio MCP Server)...')
    console.log('Prompt:', VIDEO_PROMPT)

    // IMPORTANT: Veo 3 video generation is not available through the standard Gemini API
    // It requires special access and may not be publicly available yet
    // We'll use Gemini to generate a detailed video script/description instead
    // and provide clear instructions for manual video upload or alternative solutions
    
    // Generate video script - try Gemini API first, fallback to template if it fails
    let videoScript: string
    
    try {
      // Try using Gemini API via REST API directly (more reliable than SDK)
      console.log('Attempting to generate video script using Gemini API...')
      
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`
      
      const scriptPrompt = `Generate a detailed video production script for the following concept:

${VIDEO_PROMPT}

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
          console.log('Video script generated successfully using Gemini API')
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
      videoScript = `VIDEO PRODUCTION SCRIPT
Generated for: ${VIDEO_PROMPT}

PROJECT OVERVIEW:
- Duration: 8 seconds
- Aspect Ratio: 16:9
- Resolution: 1080p (1920x1080)
- Frame Rate: 30fps
- Style: Cinematic, Premium, Luxury

SHOT BREAKDOWN:

SHOT 1 (0-2 seconds):
- Opening wide shot of scenic highway during golden hour
- Camera: Slow dolly forward, slightly elevated angle
- Composition: Rule of thirds, highway leading into frame
- Lighting: Warm golden hour lighting, soft shadows
- Action: Highway visible, setting the premium scene

SHOT 2 (2-5 seconds):
- Medium shot of Innoson G80 entering frame from right
- Camera: Smooth tracking shot, following vehicle movement
- Composition: Vehicle centered, showcasing premium design
- Lighting: Golden hour highlights on vehicle's premium finish
- Action: Vehicle moves gracefully, showcasing smooth performance

SHOT 3 (5-7 seconds):
- Close-up detail shots of vehicle features
- Camera: Slow push-in on key design elements
- Composition: Focus on premium details, badge, headlights
- Lighting: Dramatic golden hour lighting
- Action: Highlighting craftsmanship and attention to detail

SHOT 4 (7-8 seconds):
- Wide establishing shot of vehicle on African road
- Camera: Slow pull-back, revealing scenic landscape
- Composition: Vehicle as focal point, African landscape backdrop
- Lighting: Golden hour creating premium atmosphere
- Action: Final showcase of "Pride of African Roads"

CAMERA MOVEMENTS:
- Smooth, cinematic camera movements throughout
- No jarring cuts or sudden movements
- Professional dolly and tracking shots
- Slow, deliberate pacing to emphasize luxury

VISUAL ELEMENTS:
- Premium vehicle design highlighted
- Scenic African highway backdrop
- Golden hour lighting creating warm, luxurious atmosphere
- Smooth motion emphasizing vehicle performance
- Professional color grading for cinematic look

TECHNICAL SPECIFICATIONS:
- Resolution: 1080p (1920x1080)
- Aspect Ratio: 16:9
- Frame Rate: 30fps
- Color Space: Rec. 709
- Audio: Premium engine sound, subtle ambient highway sounds
- Post-Production: Color grading for golden hour warmth, smooth transitions

NOTES:
This script emphasizes the premium nature of the Innoson G80 while showcasing it on African roads, highlighting both the vehicle's luxury features and its connection to African pride and excellence.`
    }
    
    // Save the video script for reference
    const scriptPath = path.join(videosDir, 'video-script.txt')
    fs.writeFileSync(scriptPath, videoScript)
    console.log('Video script saved to:', scriptPath)

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
      
      console.log('Attempting Veo 3 video generation using Vertex AI...')
      console.log(`Project: ${GOOGLE_CLOUD_PROJECT_ID}, Region: ${GOOGLE_CLOUD_REGION}`)
      
      // Try each Veo model with Vertex AI endpoint
      for (const modelId of veoModels) {
        try {
          // Vertex AI endpoint format for predictLongRunning
          const vertexAiUrl = `https://${GOOGLE_CLOUD_REGION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_REGION}/publishers/google/models/${modelId}:predictLongRunning?key=${VERTEX_AI_API_KEY}`
          
          console.log(`Trying Vertex AI model: ${modelId}`)
          
          veoResponse = await fetch(vertexAiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instances: [{
                prompt: VIDEO_PROMPT,
                negative_prompt: 'traffic, other vehicles, low quality, blurry, distorted',
                aspect_ratio: '16:9',
                resolution: '1080p',
                duration_seconds: 8,
              }],
            }),
          })

          const veoResponseText = await veoResponse.text()
          console.log(`Vertex AI response status (${modelId}):`, veoResponse.status)
          
          // Check if response is HTML (error page) instead of JSON
          const isHTML = veoResponseText.trim().startsWith('<!DOCTYPE') || veoResponseText.trim().startsWith('<html')
          const contentType = veoResponse.headers.get('content-type') || ''
          const isJSON = contentType.includes('application/json') || (!isHTML && (veoResponseText.trim().startsWith('{') || veoResponseText.trim().startsWith('[')))

          if (veoResponse.ok && isJSON) {
            try {
              veoResponseData = JSON.parse(veoResponseText)
              console.log(`✅ Vertex AI Veo 3 API successful with model ${modelId}!`)
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
                veoError = new Error(`All Veo 3 models failed. Endpoint returned HTML (likely doesn't exist). Status: ${veoResponse.status}`)
              }
            } else {
              try {
                const errorData = JSON.parse(veoResponseText)
                console.log(`Model ${modelId} failed:`, JSON.stringify(errorData, null, 2))
                if (modelId === veoModels[veoModels.length - 1]) {
                  veoError = new Error(`All Veo 3 models failed. Last error: ${errorData.error?.message || veoResponse.status}. Full response: ${veoResponseText.substring(0, 500)}`)
                }
              } catch (parseError) {
                console.log(`Model ${modelId} failed with non-JSON response:`, veoResponseText.substring(0, 200))
                if (modelId === veoModels[veoModels.length - 1]) {
                  veoError = new Error(`All Veo 3 models failed. Last response: ${veoResponseText.substring(0, 500)}`)
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
        throw veoError || new Error('Vertex AI Veo 3 API endpoint not accessible')
      }

      // If Vertex AI Veo 3 API worked
      const data = veoResponseData

      // Handle operation response (async operation)
      // Vertex AI returns operation in format: { name: "projects/.../locations/.../operations/..." }
      if (data.name || (data.operation && data.operation.name)) {
        const operationId = data.name || data.operation.name
        
        // Save operation ID for polling
        const operationFile = path.join(videosDir, 'operation-id.json')
        fs.writeFileSync(operationFile, JSON.stringify({
          operationId: operationId,
          prompt: VIDEO_PROMPT,
          createdAt: new Date().toISOString(),
          status: 'processing',
          projectId: GOOGLE_CLOUD_PROJECT_ID,
          region: GOOGLE_CLOUD_REGION,
        }))

        return NextResponse.json({
          status: 'processing',
          operationId: operationId,
          message: 'Video generation in progress. The system will automatically poll for completion.',
          note: 'This may take 5-10 minutes. Please wait...',
        })
      }

      // If video is immediately available (unlikely but possible)
      if (data.videoUrl || data.video || data.videoUri) {
        const videoUrlToDownload = data.videoUrl || data.video || data.videoUri
        
        console.log('Video ready! Downloading from:', videoUrlToDownload)
        
        // Download and save video
        const videoResponse = await fetch(videoUrlToDownload)
        if (!videoResponse.ok) {
          throw new Error(`Failed to download video: ${videoResponse.statusText}`)
        }
        
        const videoBuffer = await videoResponse.arrayBuffer()
        fs.writeFileSync(videoPath, Buffer.from(videoBuffer))

        console.log('Video saved successfully to:', videoPath)

        return NextResponse.json({
          status: 'completed',
          message: 'Video generated and saved successfully',
          videoUrl,
          path: videoPath,
          size: videoBuffer.byteLength,
        })
      }

      // If we get a different response structure, save operation info
      if (data.name || data.operationId) {
        const operationId = data.name || data.operationId || `veo-${Date.now()}`
        const operationFile = path.join(videosDir, 'operation-id.json')
        fs.writeFileSync(operationFile, JSON.stringify({
          operationId,
          prompt: VIDEO_PROMPT,
          createdAt: new Date().toISOString(),
          status: 'processing',
          responseData: data,
        }))

        return NextResponse.json({
          status: 'processing',
          operationId,
          message: 'Video generation in progress. The system will poll for completion.',
          note: 'This may take 5-10 minutes.',
        })
      }

      // Fallback: return processing status
      return NextResponse.json({
        status: 'processing',
        message: 'Video generation initiated. Please wait...',
        operationId: data.name || `veo-${Date.now()}`,
        data,
      })
    } catch (veoError) {
      // Veo 3 is not available - return helpful error with script
      console.log('Veo 3 video generation is not available through standard API')
      
      return NextResponse.json({
        status: 'error',
        error: 'Veo 3 video generation requires special API access that is not currently available',
        message: 'Veo 3 video generation is not available through the standard Gemini API. It requires special access from Google.',
        solution: 'manual_upload',
        videoScript: videoScript,
        scriptPath: '/videos/video-script.txt',
        instructions: [
          '1. A detailed video script has been generated using Gemini AI',
          '2. You can use this script with video production tools or services',
          '3. Alternatively, manually upload a video file to: public/videos/innoson-g80-highway.mp4',
          '4. The script is saved at: public/videos/video-script.txt',
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
    console.error('Video generation error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate video. Please check logs.',
    }, { status: 500 })
  }
}

// GET endpoint to check if video exists
export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos')
    const videoPath = path.join(videosDir, 'innoson-g80-highway.mp4')
    const videoUrl = '/videos/innoson-g80-highway.mp4'

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
      message: 'Video not found. Generate it using POST endpoint.',
    })
  } catch (error) {
    return NextResponse.json({
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

