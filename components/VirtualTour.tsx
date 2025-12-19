'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, MapPin, Loader2, Download } from 'lucide-react'
import Button from './Button'
import VideoPlayer from './VideoPlayer'
import MagneticButton from './MagneticButton'
import { useSavedVideo } from '@/hooks/useSavedVideo'

const VirtualTour: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const { videoUrl, exists, loading: videoLoading, error: videoError, status: videoStatus, generateVideo } = useSavedVideo()
  const posterUrl = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2670&auto=format&fit=crop'

  const handleStartTour = async () => {
    if (!exists && !videoLoading) {
      // Generate video if it doesn't exist
      await generateVideo()
    }
    setIsVideoPlaying(true)
  }

  const handleGenerateVideo = async () => {
    await generateVideo()
  }

  return (
    <section id="virtual-tour" className="premium-section px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,82,163,0.1)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(28,82,163,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.6em] text-ivm-primary font-black block">
                  Interactive Experience
                </span>
                <h2 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
                  <span className="text-xl sm:text-2xl block font-light italic opacity-60 tracking-[0.2em] mb-2">Digital</span>
                  Showroom Tour
                </h2>
              </div>
              
              <p className="text-sm md:text-base text-white/40 font-light leading-relaxed tracking-wide max-w-xl">
                Step into the future of automotive excellence. Our virtual tour offers an immersive, high-definition journey through our flagship showroom, allowing you to explore every curve and detail of the Innoson fleet from anywhere in the world.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-10 pt-4">
                <MagneticButton
                  onClick={handleStartTour}
                  className="group relative px-12 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full overflow-hidden transition-all duration-700 hover:bg-ivm-primary hover:text-white"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <Play className="w-3 h-3 fill-current" />
                    Begin Journey
                  </span>
                </MagneticButton>
                
                <button 
                  className="text-white/30 hover:text-white text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-500 flex items-center gap-6 group"
                  onClick={() => window.open('https://www.google.com/maps', '_blank')}
                >
                  <span className="w-12 h-px bg-white/10 group-hover:w-16 group-hover:bg-ivm-primary transition-all duration-700" />
                  Visit Showroom
                </button>
              </div>

              {/* Features - Editorial Style */}
              <div className="pt-12 grid grid-cols-2 gap-y-12 gap-x-16 border-t border-white/5">
                {[
                  { label: 'Views', value: '360° IMMERSIVE' },
                  { label: 'Quality', value: '4K ULTRA HD' },
                  { label: 'Fleet', value: 'FULL COLLECTION' },
                  { label: 'Access', value: 'GLOBAL PREVIEW' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">{feature.label}</div>
                    <div className="text-xs md:text-sm font-bold text-white tracking-[0.2em]">{feature.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Visual Element - Video Player with Veo 3 Integration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {videoLoading && !videoStatus && !videoError && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-ivm-primary/20 to-black flex items-center justify-center">
                <div className="text-center px-4">
                  <Loader2 className="w-12 h-12 text-ivm-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-300">Checking for saved video...</p>
                </div>
              </div>
            )}

            {!videoLoading && !exists && !videoError && !videoStatus && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-ivm-primary/20 to-black flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-sm text-gray-300 mb-2">No video found</p>
                  <p className="text-xs text-gray-500 mb-4">Generate a video using Veo 3</p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateVideo}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate Video
                  </Button>
                </div>
              </div>
            )}

            {videoStatus && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-ivm-primary/20 to-black flex items-center justify-center">
                <div className="text-center px-4">
                  <Loader2 className="w-12 h-12 text-ivm-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-300 mb-2">Generating Video</p>
                  <p className="text-xs text-gray-400 mb-2">{videoStatus}</p>
                  <p className="text-xs text-gray-600">This may take 5-10 minutes</p>
                </div>
              </div>
            )}
            
            {videoError && !videoLoading && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-ivm-primary/20 to-black flex items-center justify-center">
                <div className="text-center px-4 max-w-md">
                  <p className="text-sm text-red-400 mb-2">Error</p>
                  <p className="text-xs text-gray-400 mb-4">{videoError}</p>
                  {videoError.includes('not accessible') && (
                    <p className="text-xs text-gray-500 mb-4">
                      Tip: You can manually place a video file at <code className="text-ivm-primary">public/videos/innoson-g80-highway.mp4</code>
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleGenerateVideo}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {!videoLoading && exists && videoUrl && (
              <>
                <VideoPlayer
                  videoUrl={isVideoPlaying && videoUrl ? videoUrl : undefined}
                  posterUrl={posterUrl}
                  autoPlay={isVideoPlaying && !!videoUrl}
                  className="w-full"
                />
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.button
                      className="w-20 h-20 bg-ivm-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-ivm-primary/30 focus:outline-none focus:ring-2 focus:ring-ivm-primary focus:ring-offset-2 focus:ring-offset-black gpu-accelerated animate-pulse-glow pointer-events-auto"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(28, 82, 163, 0.7)',
                          '0 0 0 20px rgba(28, 82, 163, 0)',
                          '0 0 0 0 rgba(28, 82, 163, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ willChange: 'transform, box-shadow' }}
                      onClick={handleStartTour}
                      aria-label="Play virtual tour video"
                    >
                      <Play className="w-10 h-10 text-white ml-1" fill="currentColor" aria-hidden="true" />
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default VirtualTour
