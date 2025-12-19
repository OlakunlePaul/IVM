import { useState, useCallback } from 'react'

interface VeoVideoResponse {
  status: 'processing' | 'completed' | 'error'
  videoUrl?: string
  operationId?: string
  message?: string
  fallbackUrl?: string
  error?: string
}

export const useVeoVideo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [operationId, setOperationId] = useState<string | null>(null)

  const generateVideo = useCallback(async (prompt?: string): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || 'A high-quality cinematic video of a sleek luxury SUV (Innoson G80) driving smoothly on a scenic highway during golden hour, showcasing the vehicle\'s premium design and performance.',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const data: VeoVideoResponse = await response.json()

      if (data.status === 'completed' && data.videoUrl) {
        setVideoUrl(data.videoUrl)
        return data.videoUrl
      }

      if (data.status === 'processing' && data.operationId) {
        setOperationId(data.operationId)
        // Start polling
        return await pollVideoStatus(data.operationId)
      }

      if (data.fallbackUrl) {
        setVideoUrl(data.fallbackUrl)
        return data.fallbackUrl
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Veo video generation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const pollVideoStatus = useCallback(async (opId: string): Promise<string | null> => {
    const maxAttempts = 30 // Poll for up to 5 minutes (10s intervals)
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/gemini/video?operationId=${opId}`)
        const data: VeoVideoResponse = await response.json()

        if (data.status === 'completed' && data.videoUrl) {
          setVideoUrl(data.videoUrl)
          return data.videoUrl
        }

        if (data.status === 'error') {
          throw new Error(data.error || 'Video generation failed')
        }

        // Wait 10 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 10000))
        attempts++
      } catch (err) {
        console.error('Polling error:', err)
        return null
      }
    }

    setError('Video generation timed out. Please try again.')
    return null
  }, [])

  return {
    generateVideo,
    videoUrl,
    loading,
    error,
    operationId,
  }
}

