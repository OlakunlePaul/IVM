import { useState, useCallback } from 'react'

interface GeminiVideoResponse {
  content: string
  error?: string
}

export const useGeminiVideo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateVideoDescription = useCallback(async (prompt?: string): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || 'Generate a premium description for the IVM showroom virtual tour',
          type: 'video-description',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to generate description')
      }

      const data: GeminiVideoResponse = await response.json()
      return data.content || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      // Only log in development, fail silently in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Gemini video description error (non-critical):', err)
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const generateVideoMetadata = useCallback(async (): Promise<{ title: string; description: string; keywords: string[] } | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate SEO metadata for IVM showroom virtual tour',
          type: 'video-metadata',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate metadata')
      }

      const data: GeminiVideoResponse = await response.json()
      
      // Try to parse as JSON, fallback to plain text
      try {
        return JSON.parse(data.content)
      } catch {
        // If not JSON, return structured fallback
        return {
          title: 'IVM Showroom Virtual Tour | Experience Luxury',
          description: data.content.substring(0, 160),
          keywords: ['IVM', 'Innoson', 'Virtual Tour', 'Luxury SUV', 'Showroom'],
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Gemini video metadata error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    generateVideoDescription,
    generateVideoMetadata,
    loading,
    error,
  }
}

