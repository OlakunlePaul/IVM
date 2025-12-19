'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Shield, Gauge, Fuel, Zap, ArrowRight } from 'lucide-react'
import { CarModel } from '@/types'
import OptimizedImage from './OptimizedImage'
import MagneticButton from './MagneticButton'

interface ModelDetailsModalProps {
  model: CarModel | null
  isOpen: boolean
  onClose: () => void
}

const ModelDetailsModal: React.FC<ModelDetailsModalProps> = ({ model, isOpen, onClose }) => {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!model) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {/* Visual Side */}
            <div className="w-full md:w-1/2 relative h-64 md:h-auto overflow-hidden">
              <OptimizedImage
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:bg-gradient-to-r" />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8">
                <div className="bg-ivm-primary border border-ivm-primary/30 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-2xl">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white">
                    {model.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 overflow-y-auto custom-scrollbar bg-zinc-950">
              <div className="space-y-8 md:space-y-10">
                {/* Header */}
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter leading-none">
                    {model.name}
                  </h2>
                  <p className="text-white/40 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.4em] font-medium italic">
                    {model.tagline}
                  </p>
                  <div className="text-xl sm:text-2xl font-light text-ivm-primary tracking-tight pt-2">
                    {model.price} <span className="text-[10px] text-white/20 uppercase tracking-widest ml-2">Starting MSRP</span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-8 border-y border-white/5 py-8 md:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-white/20">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black">Engine</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">{model.specs.engine}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-white/20">
                      <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black">Performance</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">{model.specs.power}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-white/20">
                      <Fuel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black">Transmission</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">{model.specs.transmission}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-white/20">
                      <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black">Capacity</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">{model.specs.seats} Premium Seats</p>
                  </div>
                </div>

                {/* Brand Story Snippet */}
                <div className="space-y-4">
                  <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.5em] font-black text-white/20">Ownership Experience</h4>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-light">
                    Every {model.name} is a testament to African ingenuity. Engineered for the continental terrain without compromising on global standards of luxury and safety.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 md:pt-8">
                  <div className="flex-1 sm:flex-[1.2]">
                    <MagneticButton
                      onClick={() => {
                        onClose()
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="w-full group relative py-4 sm:py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full overflow-hidden transition-all duration-700 hover:bg-ivm-primary hover:text-white flex items-center justify-center gap-3 shadow-xl whitespace-nowrap cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <Calendar className="w-3.5 h-3.5" />
                        Book Test Drive
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-ivm-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0" 
                      />
                    </MagneticButton>
                  </div>
                  
                  <div className="flex-1">
                    <MagneticButton
                      onClick={onClose}
                      className="w-full group py-4 sm:py-5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.4em] rounded-full transition-all duration-500 hover:text-white hover:border-white/30 flex items-center justify-center gap-3 whitespace-nowrap cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        Close Catalog
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500" />
                      </span>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ModelDetailsModal

