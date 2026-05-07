'use client'
import type { Section, HeroData, TextBlockData, FeaturesData, TimelineData, PricingData, TeamData, CTAData } from '@/lib/types'
import HeroSection from './sections/HeroSection'
import TextBlockSection from './sections/TextBlockSection'
import FeaturesSection from './sections/FeaturesSection'
import TimelineSection from './sections/TimelineSection'
import PricingSection from './sections/PricingSection'
import TeamSection from './sections/TeamSection'
import CTASection from './sections/CTASection'

interface Props {
  sections: Section[]
  theme: string
}

const textVariantMap: Record<string, 'light' | 'gray'> = {
  summary: 'light',
  problem: 'gray',
  solution: 'light',
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
          case 'summary':
          case 'problem':
          case 'solution':
            return <TextBlockSection key={section.id} data={section.data as TextBlockData} variant={textVariantMap[section.type]} />
          case 'features':
            return <FeaturesSection key={section.id} data={section.data as FeaturesData} theme={theme} />
          case 'timeline':
            return <TimelineSection key={section.id} data={section.data as TimelineData} theme={theme} />
          case 'pricing':
            return <PricingSection key={section.id} data={section.data as PricingData} theme={theme} />
          case 'team':
            return <TeamSection key={section.id} data={section.data as TeamData} />
          case 'cta':
            return <CTASection key={section.id} data={section.data as CTAData} theme={theme} />
          default:
            return null
        }
      })}
    </div>
  )
}
