'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'image' | 'text' | 'card'
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  variant = 'image' 
}) => {
  const baseClasses = 'bg-gray-800 rounded'
  
  if (variant === 'image') {
    return (
      <div className={`${baseClasses} ${className} relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '50%',
            height: '100%',
          }}
        />
      </div>
    )
  }
  
  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className} p-6 space-y-4`}>
        <div className={`${baseClasses} h-64 w-full`}>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: '50%',
              height: '100%',
            }}
          />
        </div>
        <div className={`${baseClasses} h-6 w-3/4`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
        <div className={`${baseClasses} h-4 w-full`} />
      </div>
    )
  }
  
  return (
    <div className={`${baseClasses} ${className} relative overflow-hidden`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '50%',
          height: '100%',
        }}
      />
    </div>
  )
}

export default LoadingSkeleton
