'use client'

import { useState, useEffect, RefObject } from 'react'

interface MousePosition {
  x: number
  y: number
}

/**
 * Custom hook to track mouse position relative to an element
 * Returns normalized coordinates (-1 to 1) for 3D tilt effects
 */
export const useMousePosition = (ref: RefObject<HTMLElement>): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Normalize to -1 to 1 range
      const normalizedX = (x / rect.width) * 2 - 1
      const normalizedY = (y / rect.height) * 2 - 1

      setMousePosition({ x: normalizedX, y: normalizedY })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref])

  return mousePosition
}
