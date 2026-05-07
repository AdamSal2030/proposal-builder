'use client'
import type { Section, HeroData, CoverData, TextBlockData, ScopeData, SpecsData, GalleryData, InvestmentData, TimelineData, TestimonialsData, TermsData, CTAData } from '@/lib/types'
import HeroSection from './sections/HeroSection'
import CoverSection from './sections/CoverSection'
import TextBlockSection from './sections/TextBlockSection'
import ScopeSection from './sections/ScopeSection'
import SpecsSection from './sections/SpecsSection'
import GallerySection from './sections/GallerySection'
import InvestmentSection from './sections/InvestmentSection'
import TimelineSection from './sections/TimelineSection'
import TestimonialsSection from './sections/TestimonialsSection'
import TermsSection from './sections/TermsSection'
import CTASection from './sections/CTASection'

interface Props {
  sections: Section[]
  theme: string
}

export default function ProposalRenderer({ sections, theme }: Props) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg">No sections yet. Use AI to generate or add sections manually.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} data={section.data as HeroData} theme={theme} />
          case 'cover':
            return <CoverSection key={section.id} data={section.data as CoverData} theme={theme} />
          case 'summary':
          case 'about':
            return <TextBlockSection key={section.id} data={section.data as TextBlockData} variant={section.type === 'about' ? 'gray' : 'light'} />
          case 'scope':
            return <ScopeSection key={section.id} data={section.data as ScopeData} theme={theme} />
          case 'specs':
            return <SpecsSection key={section.id} data={section.data as SpecsData} theme={theme} />
          case 'gallery':
            return <GallerySection key={section.id} data={section.data as GalleryData} theme={theme} />
          case 'investment':
            return <InvestmentSection key={section.id} data={section.data as InvestmentData} theme={theme} />
          case 'timeline':
            return <TimelineSection key={section.id} data={section.data as TimelineData} theme={theme} />
          case 'testimonials':
            return <TestimonialsSection key={section.id} data={section.data as TestimonialsData} theme={theme} />
          case 'terms':
            return <TermsSection key={section.id} data={section.data as TermsData} theme={theme} />
          case 'cta':
            return <CTASection key={section.id} data={section.data as CTAData} theme={theme} />
          default:
            return null
        }
      })}
    </div>
  )
}
