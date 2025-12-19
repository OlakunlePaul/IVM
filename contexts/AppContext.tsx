'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// Types
interface FormData {
  name: string
  email: string
  phone: string
  modelInterest: string
  purpose: string
  message: string
}

type FilterType = 'All' | 'Luxury SUV' | 'Off-Road SUV' | 'Crossover SUV'
type SortType = 'default' | 'price' | 'popularity' | 'newest'

interface AppState {
  // Models state
  compareList: string[]
  savedModels: string[]
  selectedFilter: FilterType
  sortBy: SortType
  expandedCard: string | null
  
  // Contact form state
  formData: FormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  submitSuccess: boolean
  autoSaveStatus: 'saved' | 'saving' | null
  
  // UI state
  activeSection: string
  hasScrolled: boolean
}

interface AppContextType extends AppState {
  // Models actions
  addToCompare: (modelId: string) => void
  removeFromCompare: (modelId: string) => void
  clearCompare: () => void
  toggleSavedModel: (modelId: string) => void
  setFilter: (filter: FilterType) => void
  setSort: (sort: SortType) => void
  setExpandedCard: (cardId: string | null) => void
  
  // Contact form actions
  updateFormData: (data: Partial<FormData>) => void
  setFormErrors: (errors: Record<string, string>) => void
  clearFormErrors: (field?: string) => void
  setSubmitting: (isSubmitting: boolean) => void
  setSubmitSuccess: (success: boolean) => void
  resetForm: () => void
  
  // UI actions
  setActiveSection: (section: string) => void
  setHasScrolled: (scrolled: boolean) => void
}

const initialState: AppState = {
  compareList: [],
  savedModels: [],
  selectedFilter: 'All',
  sortBy: 'default',
  expandedCard: null,
  formData: {
    name: '',
    email: '',
    phone: '',
    modelInterest: '',
    purpose: '',
    message: '',
  },
  formErrors: {},
  isSubmitting: false,
  submitSuccess: false,
  autoSaveStatus: null,
  activeSection: '',
  hasScrolled: false,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState)

  // Load saved data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load saved models
    const savedModelsData = localStorage.getItem('ivm_savedModels')
    if (savedModelsData) {
      try {
        const parsed = JSON.parse(savedModelsData)
        setState(prev => ({ ...prev, savedModels: parsed }))
      } catch (e) {
        console.error('Failed to load saved models:', e)
      }
    }

    // Load comparison list
    const compareData = localStorage.getItem('ivm_compareList')
    if (compareData) {
      try {
        const parsed = JSON.parse(compareData)
        setState(prev => ({ ...prev, compareList: parsed }))
      } catch (e) {
        console.error('Failed to load compare list:', e)
      }
    }

    // Load form draft
    const formDraft = localStorage.getItem('contactFormDraft')
    if (formDraft) {
      try {
        const parsed = JSON.parse(formDraft)
        setState(prev => ({ ...prev, formData: parsed }))
      } catch (e) {
        console.error('Failed to load form draft:', e)
      }
    }
  }, [])

  // Persist saved models to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('ivm_savedModels', JSON.stringify(state.savedModels))
  }, [state.savedModels])

  // Persist comparison list to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('ivm_compareList', JSON.stringify(state.compareList))
  }, [state.compareList])

  // Auto-save form data to localStorage with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasData = Object.values(state.formData).some(value => value.length > 0)
    if (!hasData) return

    setState(prev => ({ ...prev, autoSaveStatus: 'saving' }))
    const timer = setTimeout(() => {
      localStorage.setItem('contactFormDraft', JSON.stringify(state.formData))
      setState(prev => ({ ...prev, autoSaveStatus: 'saved' }))
      setTimeout(() => {
        setState(prev => ({ ...prev, autoSaveStatus: null }))
      }, 2000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [state.formData])

  // Models actions
  const addToCompare = useCallback((modelId: string) => {
    setState(prev => {
      if (prev.compareList.includes(modelId)) {
        return prev
      }
      if (prev.compareList.length >= 3) {
        return prev // Max 3 models
      }
      return {
        ...prev,
        compareList: [...prev.compareList, modelId],
      }
    })
  }, [])

  const removeFromCompare = useCallback((modelId: string) => {
    setState(prev => ({
      ...prev,
      compareList: prev.compareList.filter(id => id !== modelId),
    }))
  }, [])

  const clearCompare = useCallback(() => {
    setState(prev => ({ ...prev, compareList: [] }))
  }, [])

  const toggleSavedModel = useCallback((modelId: string) => {
    setState(prev => ({
      ...prev,
      savedModels: prev.savedModels.includes(modelId)
        ? prev.savedModels.filter(id => id !== modelId)
        : [...prev.savedModels, modelId],
    }))
  }, [])

  const setFilter = useCallback((filter: FilterType) => {
    setState(prev => ({ ...prev, selectedFilter: filter }))
  }, [])

  const setSort = useCallback((sort: SortType) => {
    setState(prev => ({ ...prev, sortBy: sort }))
  }, [])

  const setExpandedCard = useCallback((cardId: string | null) => {
    setState(prev => ({ ...prev, expandedCard: cardId }))
  }, [])

  // Contact form actions
  const updateFormData = useCallback((data: Partial<FormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }))
  }, [])

  const setFormErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      formErrors: { ...prev.formErrors, ...errors },
    }))
  }, [])

  const clearFormErrors = useCallback((field?: string) => {
    if (field) {
      setState(prev => {
        const newErrors = { ...prev.formErrors }
        delete newErrors[field]
        return { ...prev, formErrors: newErrors }
      })
    } else {
      setState(prev => ({ ...prev, formErrors: {} }))
    }
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }))
  }, [])

  const setSubmitSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, submitSuccess: success }))
  }, [])

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialState.formData,
      formErrors: {},
      isSubmitting: false,
      submitSuccess: false,
    }))
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contactFormDraft')
    }
  }, [])

  // UI actions
  const setActiveSection = useCallback((section: string) => {
    setState(prev => ({ ...prev, activeSection: section }))
  }, [])

  const setHasScrolled = useCallback((scrolled: boolean) => {
    setState(prev => ({ ...prev, hasScrolled: scrolled }))
  }, [])

  const value: AppContextType = {
    ...state,
    addToCompare,
    removeFromCompare,
    clearCompare,
    toggleSavedModel,
    setFilter,
    setSort,
    setExpandedCard,
    updateFormData,
    setFormErrors,
    clearFormErrors,
    setSubmitting,
    setSubmitSuccess,
    resetForm,
    setActiveSection,
    setHasScrolled,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

