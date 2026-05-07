'use client'
import React from 'react'
import type { Section, SectionData, HeroData, CoverData, TextBlockData, ScopeData, SpecsData, GalleryData, InvestmentData, TimelineData, TestimonialsData, TermsData, CTAData } from '@/lib/types'
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
  onUpdate: (section: Section) => void
  onInsertAt: (index: number) => void
}

const SECTION_COLORS: Record<string, string> = {
  cover: 'bg-violet-500', hero: 'bg-blue-500', summary: 'bg-sky-500',
  about: 'bg-teal-500', scope: 'bg-green-500', specs: 'bg-amber-500',
  gallery: 'bg-orange-500', investment: 'bg-emerald-600', timeline: 'bg-indigo-500',
  testimonials: 'bg-pink-500', terms: 'bg-gray-500', cta: 'bg-purple-600',
}

function renderSection(section: Section, theme: string, isEditing: boolean, onUpdate: (s: Section) => void) {
  const upd = (data: SectionData) => onUpdate({ ...section, data })
  switch (section.type) {
    case 'hero':         return <HeroSection data={section.data as HeroData} theme={theme} isEditing={isEditing} onUpdate={(d) => upd(d)} />
    case 'cover':        return <CoverSection data={section.data as CoverData} theme={theme} isEditing={isEditing} onUpdate={(d) => upd(d)} />
    case 'summary':      return <TextBlockSection data={section.data as TextBlockData} variant="light" isEditing={isEditing} onUpdate={(d) => upd(d)} />
    case 'about':        return <TextBlockSection data={section.data as TextBlockData} variant="gray" isEditing={isEditing} onUpdate={(d) => upd(d)} />
    case 'scope':        return <ScopeSection data={section.data as ScopeData} theme={theme} />
    case 'specs':        return <SpecsSection data={section.data as SpecsData} theme={theme} />
    case 'gallery':      return <GallerySection data={section.data as GalleryData} theme={theme} />
    case 'investment':   return <InvestmentSection data={section.data as InvestmentData} theme={theme} />
    case 'timeline':     return <TimelineSection data={section.data as TimelineData} theme={theme} />
    case 'testimonials': return <TestimonialsSection data={section.data as TestimonialsData} theme={theme} />
    case 'terms':        return <TermsSection data={section.data as TermsData} theme={theme} />
    case 'cta':          return <CTASection data={section.data as CTAData} theme={theme} isEditing={isEditing} onUpdate={(d) => upd(d)} />
    default:             return null
  }
}

function InsertBar({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="group/ins relative h-8 flex items-center justify-center cursor-pointer z-20"
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <div className="absolute inset-x-0 h-px bg-blue-400 top-1/2 -translate-y-1/2 opacity-0 group-hover/ins:opacity-100 transition-opacity" />
      <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 group-hover/ins:bg-blue-600 group-hover/ins:border-blue-600 flex items-center justify-center text-gray-300 group-hover/ins:text-white opacity-0 group-hover/ins:opacity-100 transition-all relative z-10 shadow-sm">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    </div>
  )
}

export default function EditorCanvas({ sections, theme, selectedId, onSelect, onMove, onRemove, onUpdate, onInsertAt }: Props) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 select-none gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-500">Your proposal is empty</p>
        <p className="text-sm text-gray-400 -mt-2">Click "Add Block" or the + button to add your first section</p>
        <button
          onClick={() => onInsertAt(0)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add First Block
        </button>
      </div>
    )
  }

  return (
    <div>
      <InsertBar onClick={() => onInsertAt(0)} />

      {sections.map((section, i) => {
        const isEditing = selectedId === section.id
        const label = SECTION_LABELS[section.type] ?? section.type
        const dotColor = SECTION_COLORS[section.type] ?? 'bg-gray-400'

        return (
          <React.Fragment key={section.id}>
            <div
              id={`section-${section.id}`}
              className={`relative group transition-all duration-150 ${isEditing ? 'ring-2 ring-inset ring-blue-500' : 'hover:ring-1 hover:ring-inset hover:ring-blue-300 hover:ring-opacity-60'}`}
              onClick={() => { if (!isEditing) onSelect(section.id) }}
            >
              {/* Section type badge */}
              <div className={`absolute top-2 left-2 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-2 py-0.5 transition-opacity pointer-events-none select-none ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                <span className="text-[11px] font-semibold text-gray-600">{label}</span>
              </div>

              {/* Toolbar */}
              <div className={`absolute top-2 right-2 z-40 flex items-center gap-0.5 bg-white border border-gray-200 shadow-lg rounded-lg px-1 py-1 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(section.id, 'up') }}
                  disabled={i === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded-md hover:bg-gray-100 transition-colors"
                  title="Move up"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(section.id, 'down') }}
                  disabled={i === sections.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded-md hover:bg-gray-100 transition-colors"
                  title="Move down"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(section.id) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  title="Delete block"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              {/* Section content — editing sections allow pointer events for inline inputs */}
              <div
                className={isEditing ? '' : 'pointer-events-none select-none'}
                onClickCapture={(e) => {
                  if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
                    e.stopPropagation()
                  } else if ((e.target as HTMLElement).closest('a')) {
                    e.preventDefault()
                  }
                }}
              >
                {renderSection(section, theme, isEditing, onUpdate)}
              </div>

              {/* Click-to-edit hint for complex sections (not inline editable) */}
              {!isEditing && !['hero', 'cover', 'summary', 'about', 'cta'].includes(section.type) && (
                <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                    Click to edit in panel →
                  </div>
                </div>
              )}
            </div>

            <InsertBar onClick={() => onInsertAt(i + 1)} />
          </React.Fragment>
        )
      })}
    </div>
  )
}
