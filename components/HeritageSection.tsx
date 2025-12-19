'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import OptimizedImage from './OptimizedImage'

const HERITAGE_MOMENTS = [
  {
    title: "Masterful Craftsmanship",
    description: "Every IVM interior is a gallery of hand-finished excellence. From premium leather stitching to ergonomic contours, we redefine comfort for the African road. Our artisans ensure that every detail, from the soft-touch surfaces to the precise needlework, reflects the highest standards of luxury.",
    image: "https://www.innosonvehicles.com/wp-content/uploads/2021/09/56A6261-1000x667.jpg", // G5T Interior detail
    side: "left"
  },
  {
    title: "Precision Engineering",
    description: "At the core of the IVM fleet lies a masterpiece of industrial innovation. Our vehicles are powered by advanced turbocharged engines designed for peak thermal efficiency and absolute reliability. Each chassis is reinforced with high-strength steel and calibrated for superior shock absorption, ensuring a smooth, commanding presence on both urban highways and challenging off-road terrains.",
    image: "https://www.innosonvehicles.com/wp-content/uploads/2021/09/56A6219-1000x667.jpg", // G5T Mechanical/Chassis focus
    side: "right"
  },
  {
    title: "A Vision of Luxury",
    description: "The Innoson legacy is more than just mobility; it is a symbol of prestige and continental progress. We combine cutting-edge smart technology—including responsive infotainment systems and advanced driver-assist features—with a design language that celebrates African heritage. Experience a world-class journey where every drive is a statement of success.",
    image: "https://www.innosonvehicles.com/wp-content/uploads/2021/09/56A6220-1000x667.jpg", // G5T Premium Side/Interior
    side: "left"
  }
]

const HeritageSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Create transforms for each image individually (Hooks must be called unconditionally)
  const imageTransform0 = useTransform(smoothProgress, [0, 1], ["-10%", "10%"])
  const imageTransform1 = useTransform(smoothProgress, [0, 1], ["10%", "-10%"])
  const imageTransform2 = useTransform(smoothProgress, [0, 1], ["-10%", "10%"])
  const imageTransforms = [imageTransform0, imageTransform1, imageTransform2]

  return (
    <section 
      ref={containerRef}
      className="relative bg-black py-32 overflow-hidden"
    >
      {/* Background Decorative Text */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <motion.h2 
          className="text-[20vw] font-serif font-black whitespace-nowrap"
          style={{ x: useTransform(smoothProgress, [0, 1], ["20%", "-20%"]) }}
        >
          PRIDE OF AFRICA
        </motion.h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-64 md:space-y-96">
          {HERITAGE_MOMENTS.map((moment, index) => {
            const isRight = moment.side === "right"
            
            return (
              <div 
                key={index}
                className={`flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
              >
                {/* Image Wrapper */}
                <div className="w-full md:w-3/5">
                  <motion.div
                    className="relative aspect-[4/5] md:aspect-[16/9] overflow-hidden rounded-sm"
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ 
                        y: imageTransforms[index]
                      }}
                    >
                      <OptimizedImage
                        src={moment.image}
                        alt={moment.title}
                        className="w-full h-full object-cover scale-110 grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                  </motion.div>
                </div>

                {/* Text Content */}
                <div className="w-full md:w-2/5 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: isRight ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.5em] text-ivm-primary font-black mb-4 block">
                      Chapter 0{index + 1}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                      {moment.title}
                    </h3>
                    <p className="text-white/40 text-sm md:text-base font-light leading-relaxed tracking-wide">
                      {moment.description}
                    </p>
                    
                    <motion.div 
                      className="w-12 h-px bg-ivm-primary/30 mt-12"
                      initial={{ width: 0 }}
                      whileInView={{ width: 48 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Finishing Touch: Vertical Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </section>
  )
}

export default HeritageSection

