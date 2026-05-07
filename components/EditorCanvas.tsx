'use client'
import type { Section, HeroData, CoverData, TextBlockData, ScopeData, SpecsData, GalleryData, InvestmentData, TimelineData, TestimonialsData, TermsData, CTAData } from '@/lib/types'
import { SECTION_LABELS } from '@/lib/utils'
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
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
  onRemove: (id: string) => void
}

function renderSection(section: Section, theme: string) {
  switch (section.type) {
    case 'hero':    return <HeroSection data={section.data as HeroData} theme={theme} />
    case 'cover':   return <CoverSection data={section.data as CoverData} theme={theme} />
    case 'summary': return <TextBlockSection data={section.data as TextBlockData} variant="light" />
    case 'about':   return <TextBlockSection data={section.data as TextBlockData} variant="gray" />
    case 'scope':   return <ScopeSection data={section.data as ScopeData} theme={theme} />
    case 'specs':   return <SpecsSection data={section.data as SpecsData} theme={theme} />
    case 'gallery': return <GallerySection data={section.data as GalleryData} theme={theme} />
    case 'investment': return <InvestmentSection data={section.data as InvestmentData} theme={theme} />
    case 'timeline': return <TimelineSection data={section.data as TimelineData} theme={theme} />
    case 'testimonials': return <TestimonialsSection data={section.data as TestimonialsData} theme={theme} />
    case 'terms':   return <TermsSection data={section.data as TermsData} theme={theme} />
    case 'cta':     return <CTASection data={section.data as CTAData} theme={theme} />
    default:        return null
  }
}

const SECTION_COLORS: Record<string, string> = {
  cover: 'bg-violet-500', hero: 'bg-blue-500', summary: 'bg-sky-500',
  about: 'bg-teal-500', scope: 'bg-green-500', specs: 'bg-amber-500',
  gallery: 'bg-orange-500', investment: 'bg-emerald-600', timeline: 'bg-indigo-500',
  testimonials: 'bg-pink-500', terms: 'bg-gray-500', cta: 'bg-purple-600',
}

export default function EditorCanvas({ sections, theme, selectedId, onSelect, onMove, onRemove }: Props) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 select-none">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">No blocks yet</p>
        <p className="text-sm text-gray-400 mt-1">Click "Add Block" in the sidebar to get started</p>
      </div>
    )
  }

  return (
    <div>
      {sections.map((section, i) => {
        const isSelected = selectedId === section.id
        const label = SECTION_LABELS[section.type] ?? section.type
        const dotColor = SECTION_COLORS[section.type] ?? 'bg-gray-400'

        return (
          <div
            key={section.id}
            className={`relative group transition-all duration-150 ${isSelected ? 'ring-2 ring-inset ring-blue-500 ring-offset-0' : 'hover:ring-1 hover:ring-inset hover:ring-blue-300'}`}
            onClick={() => onSelect(section.id)}
          >
            {/* Section label badge */}
            <div className={`absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-2.5 py-1 transition-opacity duration-150 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
              <span className="text-xs font-semibold text-gray-600">{label}</span>
            </div>

            {/* Toolbar */}
            <div className={`absolute top-3 right-3 z-40 flex items-center gap-1 bg-white border border-gray-200 shadow-lg rounded-xl px-1.5 py-1 transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(section.id) }}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <button
                onClick={(e) => { e.stopPropagation(); onMove(section.id, 'up') }}
                disabled={i === 0}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded-lg hover:bg-gray-100 transition-colors"
                title="Move up"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMove(section.id, 'down') }}
                disabled={i === sections.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded-lg hover:bg-gray-100 transition-colors"
                title="Move down"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(section.id) }}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete block"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Actual section content */}
            <div className="pointer-events-none select-none">
              {renderSection(section, theme)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
