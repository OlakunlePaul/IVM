'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Minus, Info } from 'lucide-react'
import { CarModel } from '@/types'
import OptimizedImage from './OptimizedImage'
import MagneticButton from './MagneticButton'

interface ModelComparisonModalProps {
  models: CarModel[]
  isOpen: boolean
  onClose: () => void
  onRemove: (id: string) => void
}

const ModelComparisonModal: React.FC<ModelComparisonModalProps> = ({ models, isOpen, onClose, onRemove }) => {
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

  if (models.length === 0) return null

  const specs = [
    { label: 'Price', key: 'price' },
    { label: 'Category', key: 'category' },
    { label: 'Engine', subKey: 'engine' },
    { label: 'Power', subKey: 'power' },
    { label: 'Transmission', subKey: 'transmission' },
    { label: 'Seats', subKey: 'seats' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">Vehicle Comparison</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Side-by-side technical evaluation</p>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6 md:p-8">
              <div className="min-w-[800px]">
                {/* Table Header with Images */}
                <div className="grid grid-cols-[200px_repeat(3,1fr)] gap-8 mb-12">
                  <div /> {/* Spacer for labels column */}
                  {models.map((model) => (
                    <div key={model.id} className="relative group">
                      <button
                        onClick={() => onRemove(model.id)}
                        className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove from comparison"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 mb-6 group-hover:border-ivm-primary/50 transition-colors">
                        <OptimizedImage
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{model.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-ivm-primary font-black">{model.category}</p>
                    </div>
                  ))}
                  {/* Fill remaining slots if less than 3 */}
                  {Array.from({ length: 3 - models.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 opacity-20">
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-white/40" />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Empty Slot</p>
                    </div>
                  ))}
                </div>

                {/* Specs Rows */}
                <div className="space-y-1">
                  {specs.map((spec) => (
                    <div 
                      key={spec.label} 
                      className="grid grid-cols-[200px_repeat(3,1fr)] gap-8 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-ivm-primary/40 group-hover:bg-ivm-primary transition-colors" />
                        <span className="text-xs uppercase tracking-[0.2em] font-black text-white/30 group-hover:text-white/60 transition-colors">
                          {spec.label}
                        </span>
                      </div>
                      
                      {models.map((model) => {
                        const value = spec.subKey 
                          ? (model.specs as any)[spec.subKey] 
                          : (model as any)[spec.key!]
                        
                        return (
                          <div key={`${model.id}-${spec.label}`} className="flex items-center">
                            <span className={`text-sm tracking-wide ${spec.label === 'Price' ? 'text-ivm-primary font-bold' : 'text-white/80'}`}>
                              {value}
                            </span>
                          </div>
                        )
                      })}
                      
                      {/* Empty slots */}
                      {Array.from({ length: 3 - models.length }).map((_, i) => (
                        <div key={`empty-val-${spec.label}-${i}`} className="flex items-center">
                          <Minus className="w-4 h-4 text-white/10" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-zinc-900/30 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white/40">
                <Info className="w-4 h-4" />
                <p className="text-[10px] uppercase tracking-widest">Select up to 3 models for a precise comparison</p>
              </div>
              <MagneticButton
                onClick={onClose}
                className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] rounded-full hover:bg-ivm-primary hover:text-white transition-all duration-700"
              >
                Close Comparison
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Helper component for empty slot
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

export default ModelComparisonModal

