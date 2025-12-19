import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HeritageSection from '@/components/HeritageSection'
import FeaturedModels from '@/components/FeaturedModels'
import VirtualTour from '@/components/VirtualTour'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import LoadingFallback from '@/components/LoadingFallback'
import AudioToggle from '@/components/AudioToggle'

export default function Home() {
  return (
    <div className="font-sans antialiased text-white bg-black selection:bg-ivm-primary selection:text-white">
      <Navbar />
      <AudioToggle />
      <main id="main-content">
        {/* Hero loads immediately - it's above the fold */}
        <Hero />
        
        <Suspense fallback={<div className="min-h-[100vh] bg-black" />}>
          <HeritageSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[60vh] bg-black" />}>
          <FeaturedModels />
        </Suspense>
        <Suspense fallback={<div className="min-h-[60vh] bg-black" />}>
          <VirtualTour />
        </Suspense>
        <Suspense fallback={<div className="min-h-[60vh] bg-black" />}>
          <ContactForm />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-64 bg-black" />}>
        <Footer />
      </Suspense>
    </div>
  )
}

