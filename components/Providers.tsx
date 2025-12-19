'use client'

import { AppProvider } from '@/contexts/AppContext'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return <AppProvider>{children}</AppProvider>
}


