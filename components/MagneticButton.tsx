'use client'

import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  distance?: number
  strength?: number
  type?: 'button' | 'submit' | 'reset'
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = '', 
  onClick,
  distance = 100,
  strength = 0.3,
  type
}) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY

    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (dist < distance) {
      x.set(deltaX * strength)
      y.set(deltaY * strength)
    } else {
      x.set(0)
      y.set(0)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {type ? (
        <motion.button
          type={type}
          style={{ x: springX, y: springY }}
          className={`${className} cursor-pointer`}
          onClick={onClick}
        >
          {children}
        </motion.button>
      ) : (
        <motion.div
          style={{ x: springX, y: springY }}
          className={`${className} cursor-pointer`}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

export default MagneticButton

