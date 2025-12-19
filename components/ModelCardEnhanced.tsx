'use client'

import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CarModel } from '@/types'
import { Share2, Heart, ArrowRight } from 'lucide-react'
import OptimizedImage from './OptimizedImage'
import { useAppContext } from '@/contexts/AppContext'

interface ModelCardEnhancedProps {
  model: CarModel
  index: number
  isExpanded?: boolean
  onToggleExpand?: () => void
  onCompare?: () => void
  onShare?: () => void
  onSave?: () => void
  badge?: 'New' | 'Popular' | 'Limited Stock' | null
}

const ModelCardEnhanced = forwardRef<HTMLDivElement, ModelCardEnhancedProps>(({ 
  model, 
  index,
  isExpanded = false,
  onToggleExpand,
  onCompare,
  onShare,
  onSave,
  badge
}, ref) => {
  const internalRef = useRef<HTMLDivElement>(null)

  // Merge the forwarded ref with our internal ref
  useImperativeHandle(ref, () => internalRef.current!)

  const { savedModels, toggleSavedModel } = useAppContext()
  const isSaved = savedModels.includes(model.id)
  
  // Mouse position tracking for 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring animations for tilt
  const rotateX = useSpring(useTransform(y, [-1, 1], [8, -8]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(x, [-1, 1], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  })

  // Card lift effect
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!internalRef.current || isExpanded) return

    const rect = internalRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const normalizedX = mouseX / (rect.width / 2)
    const normalizedY = mouseY / (rect.height / 2)

    x.set(normalizedX)
    y.set(normalizedY)
    scale.set(1.03)
  }

  const handleMouseLeave = () => {
    if (isExpanded) return
    x.set(0)
    y.set(0)
    scale.set(1)
  }

  const handleSave = () => {
    toggleSavedModel(model.id)
    onSave?.()
  }

  return (
    <motion.div
      ref={internalRef}
      className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 overflow-hidden group cursor-pointer relative rounded-2xl transition-colors duration-500 hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layout
    >
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none" />

      {/* Quick Action Buttons - Minimal */}
      <div className="absolute top-6 right-6 z-40 flex gap-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <button
          className={`text-white/40 hover:text-white transition-all duration-300 hover:scale-125 p-1`}
          onClick={(e) => {
            e.stopPropagation()
            handleSave()
          }}
          aria-label={isSaved ? "Remove from saved" : "Save model"}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-ivm-primary text-ivm-primary drop-shadow-[0_0_8px_rgba(28,82,163,0.6)]' : ''}`} />
        </button>
        <button
          className="text-white/40 hover:text-white transition-all duration-300 hover:scale-125 p-1"
          onClick={(e) => {
            e.stopPropagation()
            onShare?.()
          }}
          aria-label="Share model"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Status Badge */}
      {badge && (
        <motion.div
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 bg-ivm-primary/10 border border-ivm-primary/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-ivm-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-ivm-primary-light">
              {badge}
            </span>
          </div>
        </motion.div>
      )}

      {/* Image Container */}
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden bg-black">
        <motion.div
          style={{
            scale: isExpanded ? 1 : useTransform(scale, [1, 1.03], [1, 1.05]),
            transformStyle: 'preserve-3d',
          }}
          className="w-full h-full"
        >
          <OptimizedImage
            src={model.image}
            alt={`${model.name}`}
            className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 transition-all duration-1000 grayscale-[0.1] group-hover:grayscale-0 scale-[1.05] group-hover:scale-100"
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-8 md:p-10 relative z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-10 gap-6">
          <div className="space-y-2 md:space-y-3">
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-ivm-primary font-black">
              {model.category}
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-none">{model.name}</h3>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-2">Starting at</div>
            <div className="text-xl md:text-2xl font-light text-white tracking-tight drop-shadow-lg">{model.price}</div>
          </div>
        </div>
        
        {/* Collapsed State - Minimal Specs */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-2 gap-y-6 md:gap-y-8 mb-10 md:mb-12">
                <div className="space-y-2">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">Power</div>
                  <div className="text-xs md:text-sm text-white/70 font-medium tracking-wide">{model.specs.power}</div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">Seats</div>
                  <div className="text-xs md:text-sm text-white/70 font-medium tracking-wide">{model.specs.seats} Premium Seats</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 md:pt-10 border-t border-white/10">
                <button
                  className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-black text-ivm-primary hover:text-white transition-all duration-500 flex items-center gap-4 md:gap-6 group/btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpand?.()
                  }}
                >
                  Explore Details
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500 shadow-ivm-primary" />
                </button>
                
                {onCompare && (
                  <button
                    className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-white/30 hover:text-white transition-all duration-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCompare()
                    }}
                  >
                    + Compare
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded State - Refined Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-8 md:pt-10 border-t border-white/10 space-y-8 md:space-y-10">
                <div className="grid grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-2">Engine</div>
                      <div className="text-xs md:text-sm text-white/90 font-medium">{model.specs.engine}</div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-2">Power</div>
                      <div className="text-xs md:text-sm text-white/90 font-medium">{model.specs.power}</div>
                    </div>
                  </div>
                  <div className="space-y-4 md:space-y-6 text-right">
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-2">Transmission</div>
                      <div className="text-xs md:text-sm text-white/90 font-medium">{model.specs.transmission}</div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-2">Seating</div>
                      <div className="text-xs md:text-sm text-white/90 font-medium">{model.specs.seats} Full Leather</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:gap-6">
                  <button
                    className="w-full py-5 md:py-6 bg-ivm-primary text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-700 hover:bg-blue-700 shadow-xl rounded-full"
                  >
                    Request Private Preview
                  </button>
                  <button
                    className="w-full py-4 md:py-5 border border-white/10 text-white/40 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-500 hover:text-white hover:border-white/30 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleExpand?.()
                    }}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

ModelCardEnhanced.displayName = 'ModelCardEnhanced'

export default ModelCardEnhanced
