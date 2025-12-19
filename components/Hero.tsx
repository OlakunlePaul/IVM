'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { FEATURED_MODELS } from '@/lib/constants'
import { useImagePreloader } from '@/hooks/useImagePreloader'
import { useAppContext } from '@/contexts/AppContext'
import { useHeroVideo } from '@/hooks/useHeroVideo'
import { useMousePosition } from '@/hooks/useMousePosition'
import MagneticButton from './MagneticButton'

// Hero background images with model associations - Only 3 images
const HERO_IMAGES = [
  { image: FEATURED_MODELS[0].image, model: FEATURED_MODELS[0] },
  { image: FEATURED_MODELS[1].image, model: FEATURED_MODELS[1] },
  { image: FEATURED_MODELS[2].image, model: FEATURED_MODELS[2] },
]

const CAROUSEL_INTERVAL = 5000 // 5 seconds

const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(CAROUSEL_INTERVAL)
  const { hasScrolled, setHasScrolled } = useAppContext()
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { x, y } = useMousePosition(heroRef)
  const { videoUrl: heroVideoUrl, exists: heroVideoExists, loading: heroVideoLoading, generateVideo: generateHeroVideo } = useHeroVideo()

  // Parallax transforms
  const contentX = useSpring(useTransform(useMotionValue(x), [-1, 1], [-15, 15]), { stiffness: 150, damping: 30 })
  const contentY = useSpring(useTransform(useMotionValue(y), [-1, 1], [-15, 15]), { stiffness: 150, damping: 30 })
  const infoX = useSpring(useTransform(useMotionValue(x), [-1, 1], [-10, 10]), { stiffness: 150, damping: 30 })
  const infoY = useSpring(useTransform(useMotionValue(y), [-1, 1], [-10, 10]), { stiffness: 150, damping: 30 })

  // Sync motion values with mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  useEffect(() => {
    mouseX.set(x)
    mouseY.set(y)
  }, [x, y, mouseX, mouseY])

  // Preload all hero images for smooth carousel transitions
  const imageUrls = React.useMemo(() => HERO_IMAGES.map(item => item.image), [])
  const { loaded: imagesPreloaded } = useImagePreloader(imageUrls)

  // Auto-generate hero video if it doesn't exist (only once)
  useEffect(() => {
    if (!heroVideoExists && !heroVideoLoading) {
      // Generate hero video in the background
      generateHeroVideo().catch((err) => {
        console.log('Hero video generation failed:', err)
      })
    }
  }, [heroVideoExists, heroVideoLoading, generateHeroVideo])

  // Auto-play and loop video when it loads
  useEffect(() => {
    if (videoRef.current && heroVideoUrl && heroVideoExists) {
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err)
      })
    }
  }, [heroVideoUrl, heroVideoExists])

  // Progress indicator for carousel
  const progress = useMotionValue(0)
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30 })

  const scrollToModels = () => {
    if (typeof window === 'undefined') return
    const modelsSection = document.getElementById('models')
    if (modelsSection) {
      modelsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Track scroll to change CTA behavior
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-play carousel with progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_IMAGES.length
        progress.set(0) // Reset progress
        return nextIndex
      })
      setTimeRemaining(CAROUSEL_INTERVAL)
    }, CAROUSEL_INTERVAL)

    // Progress update interval (every 100ms for smooth animation)
    const progressInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 100)
        const progressValue = 1 - (newTime / CAROUSEL_INTERVAL)
        progress.set(progressValue)
        return newTime
      })
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [progress])

  const currentImage = HERO_IMAGES[currentImageIndex]
  const currentModel = currentImage.model

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-black"
      aria-label="Hero section - Pride of African Roads"
    >
      {/* Video Background or Image Carousel Background */}
      <div className="absolute inset-0 z-0">
        {heroVideoExists && heroVideoUrl ? (
          // Video background - showcase Innoson fleet
          <video
            ref={videoRef}
            src={heroVideoUrl}
            className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
            autoPlay
            loop
            muted
            playsInline
            style={{
              willChange: 'opacity, transform',
            }}
          />
        ) : (
          // Fallback: Image carousel (original behavior)
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{
                backgroundImage: `url(${currentImage.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'opacity, transform',
              }}
            />
          </AnimatePresence>
        )}

        {/* Fallback gradient background - always visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-30" />
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
      
      {/* Contextual Overlay - Model Information */}
      <AnimatePresence mode="wait">
        {currentModel && (
          <motion.div
            key={`model-${currentImageIndex}`}
            className="absolute bottom-10 left-8 md:left-16 z-30 hidden md:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            style={{ x: infoX, y: infoY }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wider uppercase">
                  {currentModel.name}
                </h3>
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium">
                {currentModel.tagline}
              </p>

              {/* Progress Counter - Moved from right */}
              <div className="mt-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">
                <span className="text-ivm-primary">0{currentImageIndex + 1}</span>
                <div className="w-20 h-[1px] bg-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-ivm-primary shadow-[0_0_8px_rgba(28,82,163,0.4)]"
                    style={{ 
                      width: useTransform(smoothProgress, (value) => `${value * 100}%`)
                    }}
                  />
                </div>
                <span>0{HERO_IMAGES.length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Bottom Right (Dots Only) */}
      <div className="absolute bottom-10 right-8 md:right-16 z-30 flex flex-col items-end gap-6">
        {/* Minimal Dots */}
        <div className="flex gap-3">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index)
                progress.set(0)
                setTimeRemaining(CAROUSEL_INTERVAL)
              }}
              className="group relative h-8 flex items-center"
              role="tab"
              aria-selected={index === currentImageIndex}
            >
              <div className={`h-0.5 transition-all duration-500 ${
                index === currentImageIndex ? 'w-10 bg-ivm-primary shadow-[0_0_8px_rgba(28,82,163,0.4)]' : 'w-5 bg-white/10 group-hover:bg-white/30'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ x: contentX, y: contentY }}
      >
        <div className="space-y-8">
          <div className="space-y-6">
            <motion.h1
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-serif font-bold text-white tracking-tighter leading-[0.8]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl block font-light italic opacity-60 tracking-[0.2em] mb-4">Pride of</span>
              <span className="bg-gradient-to-r from-white via-white/95 to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
                African Roads
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xs sm:text-sm md:text-base text-white/40 font-light uppercase tracking-[0.6em] max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.6 }}
            >
              The pinnacle of engineering & luxury.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-16 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <MagneticButton
              onClick={scrollToModels}
              className="group relative px-20 py-6 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.5em] rounded-full overflow-hidden transition-all duration-700 hover:border-ivm-primary hover:bg-ivm-primary shadow-2xl"
            >
              <span className="relative z-10">Explore Collection</span>
              <motion.div 
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-700" 
              />
            </MagneticButton>
            
            <MagneticButton 
              className="text-white/40 hover:text-white text-[10px] uppercase tracking-[0.6em] font-black transition-all duration-500 flex items-center gap-10 group"
              onClick={() => document.getElementById('virtual-tour')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="w-20 h-px bg-white/10 group-hover:w-24 group-hover:bg-ivm-primary transition-all duration-700" />
              Watch Story
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex flex-col items-center gap-6">
          <span className="text-[10px] uppercase tracking-[1em] font-black text-white/20">Scroll</span>
          <div className="w-[1.5px] h-16 bg-gradient-to-b from-white/10 via-ivm-primary/30 to-transparent relative overflow-hidden rounded-full">
            <motion.div 
              className="absolute top-0 left-0 w-full h-1/2 bg-ivm-primary shadow-[0_0_12px_rgba(28,82,163,0.6)]"
              animate={{ 
                y: ['-100%', '300%']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: [0.45, 0, 0.55, 1]
              }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
