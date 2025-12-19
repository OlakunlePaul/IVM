import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Vertex AI Configuration
const VERTEX_AI_API_KEY = process.env.VERTEX_AI_API_KEY || 'AQ.Ab8RN6I71MWAQLVPEgSRXJ-5Tlh3fgq-LCH7tEdhTkgPglj-rw'
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '569295257974'
const GOOGLE_CLOUD_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operationId = searchParams.get('operationId')

    if (!operationId) {
      return NextResponse.json(
        { error: 'operationId is required' },
        { status: 400 }
      )
    }

    const videosDir = path.join(process.cwd(), 'public', 'videos')
    const videoPath = path.join(videosDir, 'hero-fleet-highway.mp4')
    const videoUrl = '/videos/hero-fleet-highway.mp4'
    const operationFile = path.join(videosDir, 'hero-operation-id.json')

    // Check if video already exists
    if (fs.existsSync(videoPath)) {
      return NextResponse.json({
        status: 'completed',
        videoUrl,
        message: 'Hero video already exists',
      })
    }

    // Try to poll the operation status using Vertex AI
    try {
      // Check operation file for project/region info
      let projectId = GOOGLE_CLOUD_PROJECT_ID
      let region = GOOGLE_CLOUD_REGION
      
      if (fs.existsSync(operationFile)) {
        try {
          const operationData = JSON.parse(fs.readFileSync(operationFile, 'utf-8'))
          if (operationData.projectId) projectId = operationData.projectId
          if (operationData.region) region = operationData.region
        } catch (e) {
          // Use defaults if file can't be read
        }
      }
      
      // Vertex AI operation format: projects/{project}/locations/{region}/operations/{operationId}
      let apiUrl: string
      
      if (operationId.startsWith('projects/')) {
        // Full Vertex AI operation path
        apiUrl = `https://${region}-aiplatform.googleapis.com/v1/${operationId}?key=${VERTEX_AI_API_KEY}`
      } else if (operationId.includes('/operations/')) {
        // Has operations/ in path but might need projects/ prefix
        if (!operationId.startsWith('projects/')) {
          apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/${operationId}?key=${VERTEX_AI_API_KEY}`
        } else {
          apiUrl = `https://${region}-aiplatform.googleapis.com/v1/${operationId}?key=${VERTEX_AI_API_KEY}`
        }
      } else {
        // Just operation ID - construct full path
        apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/operations/${operationId}?key=${VERTEX_AI_API_KEY}`
      }
      
      console.log('Polling Vertex AI hero video operation:', operationId)
      console.log('Polling URL:', apiUrl.substring(0, 120) + '...')
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Hero video poll response status:', data.done ? 'done' : 'processing')
        console.log('Hero video poll response data:', JSON.stringify(data, null, 2).substring(0, 500))

        if (data.done && data.response) {
          // Operation completed, download and save video
          // The response structure for predictLongRunning is:
          // data.response.generateVideoResponse.generatedSamples[0].video.uri
          let videoUrlToDownload: string | null = null
          
          // Try different response structures
          if (data.response.generateVideoResponse?.generatedSamples?.[0]?.video?.uri) {
            videoUrlToDownload = data.response.generateVideoResponse.generatedSamples[0].video.uri
            console.log('Found hero video URI in generateVideoResponse.generatedSamples')
          } else if (data.response.videoUrl) {
            videoUrlToDownload = data.response.videoUrl
          } else if (data.response.video) {
            videoUrlToDownload = typeof data.response.video === 'string' ? data.response.video : data.response.video.uri
          } else if (data.response.videoUri) {
            videoUrlToDownload = data.response.videoUri
          }
          
          if (videoUrlToDownload) {
            // Add API key to the download URL if it's a Google API URL
            if ((videoUrlToDownload.includes('generativelanguage.googleapis.com') || 
                 videoUrlToDownload.includes('aiplatform.googleapis.com') || 
                 videoUrlToDownload.includes('storage.googleapis.com')) && 
                !videoUrlToDownload.includes('key=')) {
              videoUrlToDownload += (videoUrlToDownload.includes('?') ? '&' : '?') + `key=${VERTEX_AI_API_KEY}`
            }
            
            console.log('Hero video ready! Downloading from:', videoUrlToDownload)
            const videoResponse = await fetch(videoUrlToDownload, {
              headers: {
                'Authorization': `Bearer ${VERTEX_AI_API_KEY}`,
              },
            })
            
            if (!videoResponse.ok) {
              // Try without Authorization header if that fails
              const videoResponse2 = await fetch(videoUrlToDownload)
              if (!videoResponse2.ok) {
                throw new Error(`Failed to download hero video: ${videoResponse2.statusText}`)
              }
              const videoBuffer = await videoResponse2.arrayBuffer()
              fs.writeFileSync(videoPath, Buffer.from(videoBuffer))
            } else {
              const videoBuffer = await videoResponse.arrayBuffer()
              fs.writeFileSync(videoPath, Buffer.from(videoBuffer))
            }

            // Remove operation file
            if (fs.existsSync(operationFile)) {
              fs.unlinkSync(operationFile)
            }

            console.log('Hero video saved successfully to:', videoPath)

            return NextResponse.json({
              status: 'completed',
              videoUrl,
              message: 'Hero video generated and saved successfully',
              size: fs.statSync(videoPath).size,
            })
          } else {
            console.log('Hero video operation completed but no video URI found in response')
            console.log('Response structure:', JSON.stringify(data.response, null, 2).substring(0, 1000))
          }
        }

        if (data.done && data.error) {
          // Operation failed
          console.error('Hero video operation failed:', data.error)
          if (fs.existsSync(operationFile)) {
            fs.unlinkSync(operationFile)
          }
          return NextResponse.json({
            status: 'error',
            error: data.error.message || 'Hero video generation failed',
            details: data.error,
          }, { status: 500 })
        }

        // Still processing
        return NextResponse.json({
          status: 'processing',
          message: 'Hero video generation in progress...',
          progress: data.metadata?.progress || null,
        })
      } else {
        const errorText = await response.text()
        console.log('Hero video poll API error:', response.status)
        console.log('Hero video poll API error response:', errorText.substring(0, 500))
      }
    } catch (pollError) {
      console.error('Hero video polling error:', pollError)
      // Continue to check operation file
    }

    // Check operation file for status
    if (fs.existsSync(operationFile)) {
      const operationData = JSON.parse(fs.readFileSync(operationFile, 'utf-8'))
      if (operationData.operationId === operationId) {
        return NextResponse.json({
          status: 'processing',
          message: 'Hero video generation in progress. Please check again in a few minutes.',
        })
      }
    }

    return NextResponse.json({
      status: 'error',
      error: 'Operation not found',
    }, { status: 404 })
  } catch (error) {
    console.error('Hero video poll error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

