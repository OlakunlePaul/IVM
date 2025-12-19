import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IVM | Pride of African Roads',
  description: 'Premium luxury SUV showroom for Innoson Vehicle Manufacturing. Experience luxury, power, and innovation with our premium SUV collection.',
  keywords: ['IVM', 'Innoson', 'SUV', 'Luxury Vehicles', 'Nigeria', 'African Roads'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans antialiased text-white bg-black selection:bg-ivm-primary selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

