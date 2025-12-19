'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import { Menu, X } from 'lucide-react'
import { useScrollSpy, scrollToSection } from '@/hooks/useScrollSpy'

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Get section IDs from nav links
  const sectionIds = NAV_LINKS.map(link => link.href.replace('#', '')).filter(Boolean)
  const activeSection = useScrollSpy(sectionIds, 100)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const sectionId = href.replace('#', '')
    scrollToSection(sectionId, 80)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
        isScrolled
          ? 'py-4 backdrop-blur-2xl bg-black/40 border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.a 
              href="#" 
              className="text-2xl sm:text-3xl font-serif font-black text-white hover:text-ivm-primary transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-ivm-primary focus:ring-offset-2 focus:ring-offset-black rounded inline-block tracking-tighter"
              aria-label="INNOSON Home - Pride of African Roads"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              INNOSON
            </motion.a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.replace('#', '')
              const isActive = activeSection === sectionId
              
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-500 focus:outline-none group ${
                    isActive ? 'text-ivm-primary' : 'text-white/40 hover:text-white'
                  }`}
                  aria-label={`Navigate to ${link.label} section`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative z-10">
                    {link.label}
                  </span>
                  {/* Active indicator bar */}
                  <motion.span
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 bg-ivm-primary"
                    initial={false}
                    animate={{
                      width: isActive ? '12px' : '0px',
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  />
                </a>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-ivm-primary focus:ring-offset-2 focus:ring-offset-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              
              {/* Mobile Menu */}
              <motion.nav 
                id="mobile-menu"
                className="md:hidden pb-4 border-t border-white/10 mt-4 pt-4 relative z-50" 
                role="navigation"
                aria-label="Mobile navigation"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                {NAV_LINKS.map((link, index) => {
                  const sectionId = link.href.replace('#', '')
                  const isActive = activeSection === sectionId
                  
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="block py-3 text-gray-300 hover:text-ivm-primary transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ivm-primary focus:ring-inset rounded px-2 relative"
                      aria-label={`Navigate to ${link.label} section`}
                      aria-current={isActive ? 'page' : undefined}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className={`relative ${isActive ? 'text-ivm-primary' : ''}`}>
                        {link.label}
                        {isActive && (
                          <motion.span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ivm-primary rounded-r"
                            layoutId="mobile-active-indicator"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </span>
                    </motion.a>
                  )
                })}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
