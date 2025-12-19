'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FEATURED_MODELS } from '@/lib/constants'
import ModelCardEnhanced from './ModelCardEnhanced'
import ModelDetailsModal from './ModelDetailsModal'
import ModelComparisonModal from './ModelComparisonModal'
import { ArrowUpDown, X, ArrowRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

type FilterType = 'All' | 'Luxury SUV' | 'Off-Road SUV' | 'Crossover SUV'
type SortType = 'default' | 'price' | 'popularity' | 'newest'

const FeaturedModels: React.FC = () => {
  const {
    selectedFilter,
    sortBy,
    expandedCard,
    compareList,
    setFilter,
    setSort,
    setExpandedCard,
    addToCompare,
    removeFromCompare,
    clearCompare,
  } = useAppContext()

  const [selectedModelForModal, setSelectedModelForModal] = React.useState<typeof FEATURED_MODELS[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false)

  // Filter chips
  const filters: FilterType[] = ['All', 'Luxury SUV', 'Off-Road SUV', 'Crossover SUV']

  // Badge assignment logic
  const getBadge = (index: number): 'New' | 'Popular' | 'Limited Stock' | null => {
    if (index === 0) return 'New'
    if (index === 1) return 'Popular'
    if (index === 2) return 'Limited Stock'
    return null
  }

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = FEATURED_MODELS

    // Apply filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(model => model.category === selectedFilter)
    }

    // Apply sort
    const sorted = [...filtered]
    switch (sortBy) {
      case 'price':
        // Extract numeric value from price string (e.g., "₦18,500,000" -> 18500000)
        sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[₦,]/g, '')) || 0
          const priceB = parseInt(b.price.replace(/[₦,]/g, '')) || 0
          return priceA - priceB
        })
        break
      case 'popularity':
        // Sort by index (first is most popular)
        sorted.sort((a, b) => {
          const indexA = FEATURED_MODELS.findIndex(m => m.id === a.id)
          const indexB = FEATURED_MODELS.findIndex(m => m.id === b.id)
          return indexA - indexB
        })
        break
      case 'newest':
        // Reverse order
        sorted.reverse()
        break
      default:
        break
    }

    return sorted
  }, [selectedFilter, sortBy])

  const handleToggleExpand = (modelId: string) => {
    const model = FEATURED_MODELS.find(m => m.id === modelId)
    if (model) {
      setSelectedModelForModal(model)
      setIsModalOpen(true)
    }
  }

  const handleCompare = (modelId: string) => {
    if (compareList.includes(modelId)) {
      removeFromCompare(modelId)
    } else {
      addToCompare(modelId)
    }
  }

  const handleShare = (modelId: string) => {
    if (typeof window === 'undefined') return
    const model = FEATURED_MODELS.find(m => m.id === modelId)
    if (model && navigator.share) {
      navigator.share({
        title: `${model.name} - IVM`,
        text: `Check out ${model.name}: ${model.tagline}`,
        url: window.location.href + `#${modelId}`,
      })
    } else if (navigator.clipboard) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href + `#${modelId}`)
    }
  }

  return (
    <section id="models" className="premium-section px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="font-serif text-4xl md:text-7xl font-bold mb-6 md:mb-8 text-white tracking-tighter">
            <span className="text-xl sm:text-2xl block font-light italic opacity-60 tracking-[0.2em] mb-4 md:mb-6">Our Premium</span>
            SUV Collection
          </h2>
          <div className="w-16 h-px bg-ivm-primary/40 mx-auto mb-6 md:mb-8" />
          <p className="text-xs sm:text-sm text-white/40 uppercase tracking-[0.4em] sm:tracking-[0.6em] max-w-2xl mx-auto leading-relaxed px-4 font-medium">
            The perfect blend of luxury, performance, and reliability.
          </p>
        </motion.div>

        {/* Filter and Sort Controls */}
        <motion.div
          className="mb-12 md:mb-16 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between border-b border-white/10 pb-8 md:pb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Filter Chips - Horizontal scroll on mobile */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-8 md:gap-12 min-w-max pb-4 md:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilter(filter)}
                  className={`relative py-3 px-2 text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black transition-all duration-500 ${
                    selectedFilter === filter
                      ? 'text-ivm-primary'
                      : 'text-white/30 hover:text-white/70'
                  }`}
                  aria-label={`Filter by ${filter}`}
                  aria-pressed={selectedFilter === filter}
                >
                  {filter}
                  {selectedFilter === filter && (
                    <motion.div 
                      layoutId="filter-underline"
                      className="absolute -bottom-4 md:-bottom-10 left-0 right-0 h-0.5 bg-ivm-primary shadow-[0_0_8px_rgba(28,82,163,0.6)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full md:w-auto flex justify-center md:justify-end">
            <button
              className="group flex items-center gap-4 md:gap-6 text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-white/30 hover:text-white transition-all duration-500"
              onClick={() => {
                const options: SortType[] = ['default', 'price', 'popularity', 'newest']
                const currentIndex = options.indexOf(sortBy)
                const nextIndex = (currentIndex + 1) % options.length
                setSort(options[nextIndex])
              }}
              aria-label="Sort models"
            >
              <ArrowUpDown className="w-4 h-4 group-hover:text-ivm-primary transition-colors duration-500" />
              <span className="group-hover:translate-x-1 transition-transform duration-500">
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Comparison Banner */}
        {compareList.length > 0 && (
          <motion.div
            className="mb-8 backdrop-luxury border border-ivm-primary/40 rounded-xl p-6 flex items-center justify-between animate-pulse-border shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-6 text-white">
              <div className="w-2.5 h-2.5 rounded-full bg-ivm-primary animate-pulse shadow-[0_0_10px_rgba(28,82,163,0.8)]" />
              <div className="space-y-1">
                <span className="font-black text-xs tracking-[0.3em] uppercase block">Comparison Ready</span>
                <span className="text-[10px] text-white/40 tracking-widest uppercase">{compareList.length} model(s) selected for evaluation</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full hover:bg-ivm-primary hover:text-white transition-all duration-700 flex items-center gap-3 group/comp"
              >
                Compare Now
                <ArrowRight className="w-3.5 h-3.5 group-hover/comp:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={clearCompare}
                className="text-white/30 hover:text-white transition-colors p-2"
                aria-label="Clear comparison"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedModels.map((model, index) => {
              const originalIndex = FEATURED_MODELS.findIndex(m => m.id === model.id)
              return (
                <ModelCardEnhanced
                  key={model.id}
                  model={model}
                  index={index}
                  isExpanded={expandedCard === model.id}
                  onToggleExpand={() => handleToggleExpand(model.id)}
                  onCompare={() => handleCompare(model.id)}
                  onShare={() => handleShare(model.id)}
                  badge={getBadge(originalIndex)}
                />
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAndSortedModels.length === 0 && (
          <motion.div
            className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/40 text-xl font-light tracking-widest">No models found matching your criteria.</p>
            <button
              onClick={() => setFilter('All')}
              className="mt-8 text-ivm-primary hover:text-white transition-all duration-500 uppercase text-xs tracking-[0.4em] font-black border-b border-ivm-primary/20 pb-1"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      <ModelDetailsModal 
        model={selectedModelForModal} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <ModelComparisonModal
        models={FEATURED_MODELS.filter(m => compareList.includes(m.id))}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemove={removeFromCompare}
      />
    </section>
  )
}

export default FeaturedModels
