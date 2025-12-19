'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Mail, Phone, MessageSquare, Car, CheckCircle2, Save, AlertCircle } from 'lucide-react'
import FormField from './FormField'
import Button from './Button'
import MagneticButton from './MagneticButton'
import { FEATURED_MODELS } from '@/lib/constants'
import { useAppContext } from '@/contexts/AppContext'

const ContactFormSingle: React.FC = () => {
  const {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    autoSaveStatus,
    updateFormData,
    setFormErrors,
    clearFormErrors,
    setSubmitting,
    setSubmitSuccess,
    resetForm,
  } = useAppContext()

  // Phone formatting
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 0) return ''
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`
    if (numbers.length <= 10) return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`
  }

  // Validation functions
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    return phone.replace(/\D/g, '').length >= 10
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Auto-format phone number
    if (name === 'phone') {
      const formatted = formatPhone(value)
      updateFormData({ [name]: formatted })
    } else {
      updateFormData({ [name]: value })
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      clearFormErrors(name)
    }

    // Real-time validation
    if (name === 'email' && value && !validateEmail(value)) {
      setFormErrors({ email: 'Please enter a valid email address' })
    } else if (name === 'phone' && value && !validatePhone(value)) {
      setFormErrors({ phone: 'Please enter a valid phone number (min 10 digits)' })
    } else if (formErrors[name]) {
      clearFormErrors(name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Full Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (min 10 digits)'
    }
    if (!formData.modelInterest) newErrors.modelInterest = 'Please select a model of interest'
    if (!formData.purpose) newErrors.purpose = 'Please select your purpose'
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setSubmitting(true)
    setSubmitSuccess(false)

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData)
      setSubmitting(false)
      setSubmitSuccess(true)
      
      // Clear form
      resetForm()

      // Reset success state after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    }, 1500)
  }

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Cinematic Glint */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-ivm-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Auto-save indicator */}
      <AnimatePresence>
        {autoSaveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-6 right-8 flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-black text-white/20 bg-white/[0.03] px-4 py-2 rounded-full backdrop-blur-md border border-white/5"
          >
            <Save className={`w-3 h-3 ${autoSaveStatus === 'saving' ? 'animate-spin' : ''}`} />
            <span>{autoSaveStatus === 'saving' ? 'Synching...' : 'Secured'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {submitSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full text-center py-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200, damping: 20 }}
            className="w-24 h-24 border border-green-500/30 bg-green-500/5 rounded-full flex items-center justify-center mb-10"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h3 className="text-2xl font-serif font-bold text-white mb-4 tracking-tight uppercase">Message Received</h3>
          <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm tracking-wide">
            Your inquiry has been encrypted and routed to our executive team. Expect a response within one business day.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Identity</label>
              <FormField
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                error={formErrors.name}
                success={!formErrors.name && formData.name.length > 0}
                className="bg-transparent border-white/5 focus:border-ivm-primary/50 py-4 transition-all duration-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Contact</label>
              <FormField
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                error={formErrors.email}
                success={!formErrors.email && formData.email.length > 0 && validateEmail(formData.email)}
                className="bg-transparent border-white/5 focus:border-ivm-primary/50 py-4 transition-all duration-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Direct Line</label>
            <FormField
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              error={formErrors.phone}
              success={!formErrors.phone && formData.phone.length > 0 && validatePhone(formData.phone)}
              className="bg-transparent border-white/5 focus:border-ivm-primary/50 py-4 transition-all duration-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Preference</label>
              <div className="relative group">
                <select
                  id="modelInterest"
                  name="modelInterest"
                  value={formData.modelInterest}
                  onChange={handleChange}
                  className="w-full py-4 px-6 bg-transparent border border-white/5 rounded-xl focus:outline-none focus:border-ivm-primary/50 text-white text-sm appearance-none cursor-pointer transition-all duration-500 group-hover:border-white/10"
                >
                  <option value="" className="bg-black">Model Interest</option>
                  {FEATURED_MODELS.map(model => (
                    <option key={model.id} value={model.name} className="bg-black">
                      {model.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-ivm-primary transition-colors duration-500">
                  <Car className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Objective</label>
              <div className="relative group">
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full py-4 px-6 bg-transparent border border-white/5 rounded-xl focus:outline-none focus:border-ivm-primary/50 text-white text-sm appearance-none cursor-pointer transition-all duration-500 group-hover:border-white/10"
                >
                  <option value="" className="bg-black">Purpose</option>
                  <option value="Purchase" className="bg-black">Purchase</option>
                  <option value="Test Drive" className="bg-black">Test Drive</option>
                  <option value="Information" className="bg-black">General Information</option>
                  <option value="Financing" className="bg-black">Financing</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-ivm-primary transition-colors duration-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 ml-1">Detail</label>
            <FormField
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your inquiry details..."
              required
              error={formErrors.message}
              success={!formErrors.message && formData.message.length > 0}
              textarea
              rows={4}
              className="bg-transparent border-white/5 focus:border-ivm-primary/50 py-4 transition-all duration-500 resize-none"
            />
          </div>

          <div className="pt-8 border-t border-white/5">
            <MagneticButton
              type="submit"
              className={`w-full py-5 rounded-full font-black text-[10px] uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-6 overflow-hidden relative group ${
                isSubmitting ? 'bg-white/5 text-white/40' : 'bg-white text-black hover:bg-ivm-primary hover:text-white'
              }`}
            >
              <span className="relative z-10">
                {isSubmitting ? 'Transmitting...' : submitSuccess ? 'Sent Successfully' : 'Request Connection'}
              </span>
              {!isSubmitting && <Send className="w-3 h-3 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />}
            </MagneticButton>
            
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/10 text-center mt-6 font-black">
              End-to-End Encrypted Inquiry System
            </p>
          </div>
        </form>
      )}
    </div>
  )
}

export default ContactFormSingle
