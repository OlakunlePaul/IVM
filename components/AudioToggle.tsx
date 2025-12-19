'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

const AudioToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const hasInteractedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element once
  useEffect(() => {
    const audioUrl = '/audio/showroom-ambient.mp3'
    const audio = new Audio(audioUrl)
    audio.loop = true
    audio.volume = 0.4
    audio.preload = 'auto'
    audioRef.current = audio

    const handleCanPlay = () => {
      console.log("Audio ready to play")
      setIsReady(true)
      setHasError(false)
      
      // If user has already interacted, attempt to play automatically
      if (hasInteractedRef.current && !isPlaying) {
        audio.play().catch(err => console.log("Auto-play blocked:", err))
      }
    }

    const handleError = (e: any) => {
      console.warn("Audio load error:", audio.error)
      setHasError(true)
      setIsReady(false)
    }

    const handlePlayEvent = () => setIsPlaying(true)
    const handlePauseEvent = () => setIsPlaying(false)

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlayEvent)
    audio.addEventListener('pause', handlePauseEvent)

    // Load the audio
    audio.load()

    // Global interaction listener to "prime" the audio context
    const handleFirstInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true
        console.log("First user interaction detected")
        
        if (audio.readyState >= 3 && !isPlaying) {
          audio.play().catch(err => console.log("Interaction play blocked:", err))
        }
      }
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('touchstart', handleFirstInteraction, { once: true })
    window.addEventListener('scroll', handleFirstInteraction, { once: true })

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlayEvent)
      audio.removeEventListener('pause', handlePauseEvent)
      audio.pause()
      audioRef.current = null
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
    }
  }, [])

  const toggleAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!audioRef.current || !isReady) {
      console.log("Audio not ready or has error")
      // If error, try reloading
      if (hasError && audioRef.current) {
        audioRef.current.load()
      }
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(err => {
        console.error('Manual playback failed:', err)
      })
    }
  }, [isPlaying, isReady, hasError])

  // Don't show if there's a persistent error and we haven't loaded yet
  if (hasError && !isReady) {
    return null
  }

  return (
    <motion.div 
      className="fixed bottom-8 right-8 z-[100]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
    >
      <button
        onClick={toggleAudio}
        disabled={!isReady}
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-500 overflow-hidden z-[110] ${
          !isReady ? 'opacity-50 cursor-not-allowed' : 'hover:border-ivm-primary backdrop-blur-xl bg-black/40 border-white/10 shadow-lg cursor-pointer'
        }`}
        aria-label={isPlaying ? "Mute ambient sound" : "Unmute ambient sound"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'playing' : 'muted'}
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 20 }}
            transition={{ duration: 0.3 }}
          >
            {isPlaying ? (
              <Volume2 className="w-4 h-4 text-ivm-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pulsing Ring when playing */}
        {isPlaying && isReady && (
          <motion.div 
            className="absolute inset-0 rounded-full border border-ivm-primary/30"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </button>

      {/* Subtle Label */}
      <motion.span 
        className={`absolute right-16 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.4em] font-black whitespace-nowrap transition-all duration-500 pointer-events-none ${
          isPlaying ? 'text-ivm-primary opacity-60' : 'text-white/20 opacity-0 group-hover:opacity-100'
        }`}
      >
        {isPlaying ? 'Sound On' : isReady ? 'Experience Sound' : 'Loading Sound...'}
      </motion.span>
    </motion.div>
  )
}

export default AudioToggle
