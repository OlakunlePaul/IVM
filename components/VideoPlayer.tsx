'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react'
import { useGeminiVideo } from '@/hooks/useGeminiVideo'

interface VideoPlayerProps {
  videoUrl?: string
  posterUrl?: string
  autoPlay?: boolean
  className?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  autoPlay = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { generateVideoDescription, loading: geminiLoading } = useGeminiVideo()
  const [geminiDescription, setGeminiDescription] = useState<string | null>(null)

  // Generate description on mount (optional - don't block if it fails)
  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const description = await generateVideoDescription()
        if (description) {
          setGeminiDescription(description)
        }
      } catch (error) {
        // Silently fail - description generation is optional
        console.log('Video description generation skipped')
      }
    }
    fetchDescription()
  }, [generateVideoDescription])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleLoadStart = () => {
      // Only show loading if video is actually loading
      if (video.readyState < 3) {
        setIsLoading(true)
      }
    }
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedData = () => setIsLoading(false)
    const handleLoadedMetadata = () => {
      setIsLoading(false)
      updateDuration()
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => setIsLoading(false)

    // Check if video is already loaded
    if (video.readyState >= 3) {
      setIsLoading(false)
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('canplaythrough', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('canplaythrough', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [videoUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // If no video URL, show placeholder with play button
  if (!videoUrl) {
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-ivm-primary/20 to-black ${className}`}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt="Virtual Tour Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-20 h-20 bg-ivm-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ivm-primary/30 cursor-pointer animate-pulse-glow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
              </motion.div>
              {geminiLoading && (
                <p className="text-sm text-gray-400 mt-2">Generating content...</p>
              )}
              {geminiDescription && (
                <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto px-4">
                  {geminiDescription}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-cover"
        playsInline
        muted={isMuted}
        autoPlay={autoPlay}
      />

      {/* Loading Indicator - only show if video is actually loading */}
      {isLoading && videoRef.current && videoRef.current.readyState < 3 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 text-ivm-primary animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >
            {/* Progress Bar */}
            <div className="absolute bottom-16 left-0 right-0 px-4">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const video = videoRef.current
                if (!video) return
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = (e.clientX - rect.left) / rect.width
                video.currentTime = percent * duration
              }}>
                <motion.div
                  className="h-full bg-ivm-primary"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-ivm-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>

                <motion.button
                  onClick={toggleMute}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-ivm-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>

                <span className="text-sm text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <motion.button
                onClick={toggleFullscreen}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-ivm-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gemini-generated description overlay */}
      {geminiDescription && !isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4"
        >
          <p className="text-sm text-white/90 bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-md">
            {geminiDescription}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default VideoPlayer

