'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import ContactFormSingle from './ContactFormSingle'

const ContactForm: React.FC = () => {
  return (
    <section id="contact" className="premium-section px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(28,82,163,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20 md:mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="text-[10px] uppercase tracking-[0.8em] text-ivm-primary font-black mb-6 block">
            Inquiry & Support
          </span>
          <h2 className="font-serif text-4xl md:text-7xl font-bold mb-8 text-white tracking-tighter">
            <span className="text-xl sm:text-2xl block font-light italic opacity-60 tracking-[0.2em] mb-4">Personalized</span>
            Concierge Service
          </h2>
          <div className="w-16 h-px bg-ivm-primary/30 mx-auto mb-8" />
          <p className="text-sm md:text-base text-white/40 font-light uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed px-4">
            Connect with our consultants for a tailored acquisition experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-[0.4em] font-black text-white/20">The Headquarters</h3>
                <p className="text-xl md:text-2xl font-serif font-bold text-white leading-relaxed">
                  Visit our flagship facility and witness the fusion of engineering and heritage.
                </p>
              </div>

              <div className="space-y-10">
                {[
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    title: 'Location',
                    content: 'Innoson Vehicle Manufacturing\nNnewi, Anambra State, Nigeria',
                  },
                  {
                    icon: <Phone className="w-5 h-5" />,
                    title: 'Concierge',
                    content: '+234 (0) 803 123 4567\n+234 (0) 802 987 6543',
                  },
                  {
                    icon: <Mail className="w-5 h-5" />,
                    title: 'Inquiries',
                    content: 'concierge@innosonvehicles.com\nsales@innosonvehicles.com',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-8 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 border border-white/5 rounded-full flex items-center justify-center text-white/40 group-hover:text-ivm-primary group-hover:border-ivm-primary/50 transition-all duration-500 bg-white/[0.02]"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 group-hover:text-white/60 transition-colors">{item.title}</h4>
                      <p className="text-white/60 text-sm font-light whitespace-pre-line leading-relaxed tracking-wide">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ContactFormSingle />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactForm
