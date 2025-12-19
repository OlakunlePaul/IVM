import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-ivm-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-24">
          {/* Brand */}
          <div className="space-y-8">
            <h3 className="text-3xl font-serif font-black text-white tracking-tighter">INNOSON</h3>
            <p className="text-xs text-white/30 uppercase tracking-[0.4em] leading-relaxed font-medium">
              Pride of African Roads. Reimagining automotive excellence for the continental elite.
            </p>
            <div className="flex space-x-6">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-white/20 hover:text-ivm-primary transition-all duration-500 transform hover:scale-110"
                  aria-label={`Visit our ${social.label} page`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">Navigation</h4>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-all duration-500"
                    aria-label={`Navigate to ${link.label} section`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">Connect</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-white/40 group">
                <MapPin className="w-4 h-4 mt-1 group-hover:text-ivm-primary transition-colors" aria-hidden="true" />
                <span className="text-xs font-light tracking-wide leading-relaxed">Nnewi, Anambra State<br />Nigeria</span>
              </li>
              <li className="flex items-center gap-4 text-white/40 group">
                <Phone className="w-4 h-4 group-hover:text-ivm-primary transition-colors" aria-hidden="true" />
                <a href="tel:+2348031234567" className="text-xs font-light tracking-wide hover:text-white transition-colors">
                  +234 (0) 803 123 4567
                </a>
              </li>
              <li className="flex items-center gap-4 text-white/40 group">
                <Mail className="w-4 h-4 group-hover:text-ivm-primary transition-colors" aria-hidden="true" />
                <a href="mailto:info@innosonvehicles.com" className="text-xs font-light tracking-wide hover:text-white transition-colors">
                  info@innosonvehicles.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">The Brief</h4>
            <p className="text-xs text-white/30 font-light leading-relaxed tracking-wide">
              Subscribe to our private list for exclusive updates on new models and prestige events.
            </p>
            <form className="relative group" aria-label="Newsletter subscription">
              <input
                type="email"
                id="newsletter-email"
                name="newsletter-email"
                placeholder="EXECUTIVE EMAIL"
                className="w-full pb-3 bg-transparent border-b border-white/10 text-[10px] tracking-[0.3em] font-black text-white placeholder-white/10 focus:outline-none focus:border-ivm-primary transition-all duration-700"
                aria-required="true"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-3 text-white/20 hover:text-ivm-primary transition-all duration-500"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
          <p className="text-[8px] uppercase tracking-[0.4em] font-black text-white/10">
            &copy; {currentYear} INNOSON VEHICLE MANUFACTURING. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[8px] uppercase tracking-[0.4em] font-black text-white/10 hover:text-white/30 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[8px] uppercase tracking-[0.4em] font-black text-white/10 hover:text-white/30 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
