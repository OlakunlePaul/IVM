import React from 'react'
import LoadingSkeleton from './LoadingSkeleton'

/**
 * Loading fallback component for Suspense boundaries
 */
const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSkeleton variant="card" className="w-64 h-64 mx-auto" />
        </div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingFallback
