'use client'

import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CarModel } from '@/types'
import { Share2, Heart, ArrowUpRight } from 'lucide-react'
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
  const isComparing = useAppContext().compareList.includes(model.id)
  
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
          <div className="flex items-center gap-3 bg-ivm-primary border border-ivm-primary/30 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white">
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
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-white/50 font-black">
              {model.category}
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-none">{model.name}</h3>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-2">Starting at</div>
            <div className="text-xl md:text-2xl font-light text-white tracking-tight drop-shadow-lg">{model.price}</div>
          </div>
        </div>
        
        {/* Specs Display - Minimal */}
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
          <div className="flex items-center gap-4">
            <button
              className="text-[11px] md:text-[12px] uppercase tracking-[0.5em] font-black text-white hover:text-ivm-primary transition-all duration-500 flex items-center gap-2 group/btn"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand?.()
              }}
            >
              VIEW SPECS
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-500" />
            </button>

            <button
              className={`text-[11px] md:text-[12px] uppercase tracking-[0.5em] font-black transition-all duration-500 flex items-center gap-2 group/compare ${
                isComparing ? 'text-ivm-primary' : 'text-white/40 hover:text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onCompare?.()
              }}
            >
              <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center transition-colors ${
                isComparing ? 'bg-ivm-primary border-ivm-primary' : 'border-white/20 group-hover/compare:border-white/40'
              }`}>
                {isComparing && <div className="w-1 h-1 bg-white rounded-full" />}
              </div>
              {isComparing ? 'SELECTED' : 'COMPARE'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ModelCardEnhanced.displayName = 'ModelCardEnhanced'

export default ModelCardEnhanced
