'use client'

import { useState, useEffect, useRef } from 'react'

interface UseLazyImageReturn {
  imageRef: React.RefObject<HTMLImageElement>
  isLoaded: boolean
  isInView: boolean
  error: boolean
}

/**
 * Custom hook for lazy loading images with Intersection Observer
 */
export const useLazyImage = (src: string, options?: IntersectionObserverInit): UseLazyImageReturn => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const imageElement = imageRef.current
    if (!imageElement) return

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load image immediately if Intersection Observer is not supported
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
        ...options,
      }
    )

    observer.observe(imageElement)

    return () => {
      observer.disconnect()
    }
  }, [options])

  useEffect(() => {
    if (!isInView || !src) return

    const imageElement = imageRef.current
    if (!imageElement) return

    // Create new image to preload
    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
      setError(false)
    }
    
    img.onerror = () => {
      setError(true)
      setIsLoaded(false)
    }
    
    img.src = src
  }, [isInView, src])

  return { imageRef, isLoaded, isInView, error }
}
