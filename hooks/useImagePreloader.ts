'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Custom hook to preload images for better performance
 * Preloads images in the background to ensure smooth transitions
 */
export const useImagePreloader = (imageUrls: string[]): { loaded: boolean[] } => {
  const [loaded, setLoaded] = useState<boolean[]>(new Array(imageUrls.length).fill(false))
  const prevUrlsRef = useRef<string>('')

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return

    // Preload only if urls actually changed
    const currentUrls = JSON.stringify(imageUrls)
    if (currentUrls === prevUrlsRef.current) return
    prevUrlsRef.current = currentUrls

    // Reset loaded state for new set of urls
    setLoaded(new Array(imageUrls.length).fill(false))

    // Preload all images
    const preloadPromises = imageUrls.map((url, index) => {
      return new Promise<number>((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          setLoaded((prev) => {
            const newLoaded = [...prev]
            if (newLoaded[index] !== undefined) {
              newLoaded[index] = true
            }
            return newLoaded
          })
          resolve(index)
        }
        
        img.onerror = () => {
          // Still mark as "loaded" to avoid infinite loading state
          setLoaded((prev) => {
            const newLoaded = [...prev]
            if (newLoaded[index] !== undefined) {
              newLoaded[index] = true
            }
            return newLoaded
          })
          reject(index)
        }
        
        // Start loading
        img.src = url
      })
    })

    // Log success once per set
    Promise.allSettled(preloadPromises).then(() => {
      console.log('Showroom assets preloaded')
    })

  }, [imageUrls])

  return { loaded }
}
