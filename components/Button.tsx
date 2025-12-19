'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
  showSuccess?: boolean
  showError?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  showSuccess = false,
  showError = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [rippleId, setRippleId] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e)
    }

    // Create ripple effect
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: rippleId }
    setRipples((prev) => [...prev, newRipple])
    setRippleId((prev) => prev + 1)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }

  const baseClasses = 'relative px-6 py-3 font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black overflow-hidden text-sm tracking-wide text-premium'
  
  const variantClasses = {
    primary: 'bg-ivm-primary text-white hover:bg-blue-700 focus:ring-ivm-primary shadow-lg hover:shadow-xl animate-pulse-soft',
    secondary: 'backdrop-soft text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-transparent border-2 border-ivm-primary text-ivm-primary hover:bg-ivm-primary hover:text-white focus:ring-ivm-primary backdrop-blur-sm animate-pulse-border',
  }

  const isDisabled = disabled || isLoading

  // Extract props that conflict with Framer Motion
  const {
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    onDragStart,
    onDrag,
    onDragEnd,
    ...restProps
  } = props

  return (
    <motion.button
      {...(restProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDragStart' | 'onDrag' | 'onDragEnd'>)}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              left: ripple.x - 150,
              top: ripple.y - 150,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          </motion.span>
        )}
        
        {showSuccess && !isLoading && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </motion.span>
        )}
        
        {showError && !isLoading && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <XCircle className="w-5 h-5" aria-hidden="true" />
          </motion.span>
        )}
        
        {!isLoading && children}
      </span>

      {/* Shimmer effect on hover */}
      <motion.span
        className="absolute inset-0 bg-white/10"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}

export default Button
