'use client'

import React, { useState } from 'react'
import LoadingSkeleton from './LoadingSkeleton'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}

/**
 * Optimized image component using Next.js Image with lazy loading and skeleton loader
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width = 800,
  height = 600,
  sizes,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
    >
      {/* Skeleton loader - shown while loading */}
      {!isLoaded && !error && (
        <LoadingSkeleton 
          variant="image" 
          className="absolute inset-0 w-full h-full z-10"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}

      {/* Next.js Image component */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        unoptimized={src.startsWith('http') && !src.includes('images.unsplash.com')}
      />
    </div>
  )
}

export default OptimizedImage
