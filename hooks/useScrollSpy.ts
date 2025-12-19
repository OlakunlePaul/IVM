'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to detect which section is currently in view
 * Returns the ID of the active section based on scroll position
 */
export const useScrollSpy = (sectionIds: string[], offset: number = 100): string => {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset

      // Find the section that's currently in view
      let foundActive = false
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i])
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sectionIds[i])
            foundActive = true
            return
          }
        }
      }

      // If scrolled to top or no section found, clear active section
      if (!foundActive) {
        if (window.scrollY < 100) {
          setActiveSection('')
        } else {
          // Keep the last active section if we're between sections
          setActiveSection(prev => prev)
        }
      }
    }

    // Initial check
    handleScroll()

    // Throttle scroll events for performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [sectionIds, offset])

  return activeSection
}

/**
 * Smooth scroll to element with offset for fixed navbar
 */
export const scrollToSection = (sectionId: string, offset: number = 80): void => {
  if (typeof window === 'undefined') return
  
  const element = document.getElementById(sectionId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}
