'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface FormFieldProps {
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  success?: boolean
  icon?: React.ReactNode
  textarea?: boolean
  rows?: number
  ariaDescribedBy?: string
  className?: string
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  success = false,
  icon,
  textarea = false,
  rows = 5,
  ariaDescribedBy,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  const isActive = isFocused || hasValue
  const hasError = !!error

  const InputComponent = textarea ? 'textarea' : 'input'

  return (
    <div className="relative">
      {/* Input wrapper */}
      <div className="relative group">
        <InputComponent
          ref={inputRef as any}
          type={textarea ? undefined : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          rows={textarea ? rows : undefined}
          className={`w-full px-6 py-4 bg-transparent border rounded-xl focus:outline-none text-white text-sm placeholder-white/20 transition-all duration-500 ${
            hasError 
              ? 'border-red-500/50 focus:border-red-500' 
              : isFocused 
                ? 'border-ivm-primary/50 shadow-[0_0_20px_rgba(28,82,163,0.1)]' 
                : 'border-white/5 hover:border-white/10'
          } ${textarea ? 'resize-none' : ''} ${className}`}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError}
          aria-required={required}
        />

        {/* Validation Icons - High-end Placement */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
          <AnimatePresence mode="wait">
            {hasError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <AlertCircle className="w-4 h-4 text-red-500/50" />
              </motion.div>
            ) : isFocused && success && hasValue ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle2 className="w-4 h-4 text-ivm-primary/50" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="px-6 py-2 text-red-500 text-[10px] uppercase tracking-[0.2em] font-black"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FormField
