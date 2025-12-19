import { useState, useEffect } from 'react'

interface SavedVideoInfo {
  exists: boolean
  videoUrl?: string
  size?: number
  created?: string
  error?: string
}

export const useSavedVideo = () => {
  const [videoInfo, setVideoInfo] = useState<SavedVideoInfo>({ exists: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch('/api/gemini/generate-and-save')
        const data: SavedVideoInfo = await response.json()
        setVideoInfo(data)
        setError(data.error || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check video'
        setError(errorMessage)
        setVideoInfo({ exists: false, error: errorMessage })
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

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const data = await response.json()

      if (data.status === 'exists' || data.status === 'completed') {
        setVideoInfo({
          exists: true,
          videoUrl: data.videoUrl,
        })
        setStatus(null)
        return data.videoUrl
      }

      if (data.status === 'processing' && data.operationId) {
        // Start polling for video completion
        let pollCount = 0
        const maxPolls = 20 // 20 polls * 30 seconds = 10 minutes max
        
        const pollInterval = setInterval(async () => {
          pollCount++
          try {
            const pollResponse = await fetch(`/api/gemini/poll-video?operationId=${data.operationId}`)
            const pollData = await pollResponse.json()

            if (pollData.status === 'completed' && pollData.videoUrl) {
              clearInterval(pollInterval)
              setVideoInfo({
                exists: true,
                videoUrl: pollData.videoUrl,
              })
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
              setError('Video generation timed out. Please try again or use a manual video file.')
              setStatus(null)
              setLoading(false)
            } else {
              // Update status during polling
              setStatus(`Checking progress... (${pollCount}/${maxPolls})`)
            }
          } catch (pollErr) {
            console.error('Polling error:', pollErr)
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setError('Video generation timed out. Please try again or use a manual video file.')
              setStatus(null)
              setLoading(false)
            }
          }
        }, 30000) // Poll every 30 seconds

        setStatus('Video generation in progress. This may take several minutes. Please wait...')
        return null
      }

      if (data.status === 'processing') {
        setStatus('Video generation initiated. Please wait...')
        return null
      }

      if (data.status === 'error') {
        // Handle error with helpful information (video script, instructions, etc.)
        const errorMessage = data.message || data.error || 'Video generation failed'
        const fullError = data.videoScript 
          ? `${errorMessage}\n\nA video script has been generated and saved. Check the console for details.`
          : errorMessage
        
        // Log additional information if available
        if (data.videoScript) {
          console.log('Video script generated:', data.videoScript)
          console.log('Script saved at:', data.scriptPath)
        }
        if (data.instructions) {
          console.log('Instructions:', data.instructions)
        }
        if (data.alternativeOptions) {
          console.log('Alternative options:', data.alternativeOptions)
        }
        
        setError(fullError)
        return null
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setStatus(null)
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
    videoInfo,
  }
}

