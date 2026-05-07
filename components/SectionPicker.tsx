'use client'
import type { SectionType } from '@/lib/types'

interface SectionOption {
  type: SectionType
  label: string
  description: string
  preview: React.ReactNode
}

const SECTION_OPTIONS: SectionOption[] = [
  {
    type: 'cover',
    label: 'Cover Page',
    description: 'Full-page title page with client name, date and branding',
    preview: (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg h-full flex flex-col p-3 gap-2">
        <div className="flex justify-between items-center mb-1">
          <div className="w-10 h-1.5 bg-blue-400/60 rounded-full" />
          <div className="w-6 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
          <div className="w-1/2 h-0.5 bg-blue-400/50 rounded-full" />
          <div className="w-3/4 h-2.5 bg-white/80 rounded-full" />
          <div className="w-1/2 h-1.5 bg-white/30 rounded-full" />
          <div className="w-1/2 h-0.5 bg-blue-400/50 rounded-full mt-1" />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-white/10 pt-2">
          {['Prepared For', 'Prepared By', 'Date'].map((l) => (
            <div key={l} className="flex flex-col gap-0.5">
              <div className="w-full h-0.5 bg-white/10 rounded-full" />
              <div className="w-2/3 h-1 bg-white/30 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'hero',
    label: 'Hero Banner',
    description: 'Full-width visual with headline, subtitle and CTA button',
    preview: (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg h-full flex flex-col items-center justify-center p-3 gap-1.5">
        <div className="w-3/4 h-2.5 bg-white/80 rounded-full" />
        <div className="w-1/2 h-1.5 bg-white/50 rounded-full" />
        <div className="mt-1 w-16 h-4 bg-white/90 rounded-full" />
      </div>
    ),
  },
  {
    type: 'summary',
    label: 'Executive Summary',
    description: 'Concise overview paragraph at the start of a proposal',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="w-1/2 h-2 bg-gray-800 rounded-full" />
        <div className="w-10 h-0.5 bg-blue-400 rounded-full" />
        <div className="space-y-1">
          {[100, 100, 80].map((w, i) => (
            <div key={i} className="h-1.5 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'about',
    label: 'About Us',
    description: 'Who you are and why you are the right partner',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="w-2/5 h-2 bg-gray-800 rounded-full" />
        <div className="w-8 h-0.5 bg-blue-400 rounded-full" />
        <div className="space-y-1">
          {[100, 90, 100, 70].map((w, i) => (
            <div key={i} className="h-1.5 bg-gray-300 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'scope',
    label: 'Scope of Work',
    description: 'What is included and excluded from this proposal',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-200 flex-shrink-0" /><div className="flex-1 h-1 bg-gray-200 rounded-full" /></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-200 flex-shrink-0" /><div className="flex-1 h-1 bg-gray-200 rounded-full" /></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-200 flex-shrink-0" /><div className="flex-1 h-1 bg-gray-200 rounded-full" /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 flex-shrink-0" /><div className="flex-1 h-1 bg-gray-200 rounded-full" /></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 flex-shrink-0" /><div className="flex-1 h-1 bg-gray-200 rounded-full" /></div>
        </div>
      </div>
    ),
  },
  {
    type: 'specs',
    label: 'Specifications',
    description: 'Key-value table — great for car specs, room details, property info',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-1.5">
        <div className="w-1/3 h-2 bg-gray-800 rounded-full mb-1" />
        {[['Make', 'Toyota'], ['Model', 'Land Cruiser'], ['Year', '2024'], ['Color', 'White']].map(([k], i) => (
          <div key={i} className={`flex gap-2 px-1 py-0.5 rounded ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
            <div className="w-1/3 h-1.5 bg-gray-400 rounded-full" />
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    ),
  },
  {
    type: 'gallery',
    label: 'Photo Gallery',
    description: 'Showcase photos — auto-layouts based on number of images',
    preview: (
      <div className="bg-white rounded-lg h-full p-2 flex flex-col gap-1.5">
        <div className="w-1/3 h-1.5 bg-gray-700 rounded-full mx-auto mb-1" />
        <div className="grid grid-cols-2 gap-1 flex-1">
          <div className="bg-blue-100 rounded-lg col-span-2 h-12" />
          <div className="bg-indigo-100 rounded-lg h-8" />
          <div className="bg-violet-100 rounded-lg h-8" />
        </div>
      </div>
    ),
  },
  {
    type: 'investment',
    label: 'Investment',
    description: 'Cost breakdown with line items and a bold total',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-1.5">
        <div className="w-1/3 h-2 bg-gray-800 rounded-full mb-1" />
        <div className="flex justify-between"><div className="w-1/2 h-1.5 bg-gray-200 rounded-full" /><div className="w-1/4 h-1.5 bg-gray-200 rounded-full" /></div>
        <div className="flex justify-between"><div className="w-2/5 h-1.5 bg-gray-200 rounded-full" /><div className="w-1/4 h-1.5 bg-gray-200 rounded-full" /></div>
        <div className="flex justify-between"><div className="w-3/5 h-1.5 bg-gray-200 rounded-full" /><div className="w-1/4 h-1.5 bg-gray-200 rounded-full" /></div>
        <div className="flex justify-between mt-auto bg-blue-600 rounded-lg px-2 py-1.5">
          <div className="w-1/3 h-2 bg-white/70 rounded-full" />
          <div className="w-1/4 h-2 bg-white rounded-full" />
        </div>
      </div>
    ),
  },
  {
    type: 'timeline',
    label: 'Timeline',
    description: 'Delivery phases or project milestones',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3">
        <div className="w-1/3 h-1.5 bg-gray-700 rounded-full mb-3" />
        <div className="space-y-2 pl-3 relative">
          <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-blue-200" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0 -ml-4" />
              <div className="flex-1 h-1.5 bg-gray-300 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Client quotes to build credibility',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="w-1/3 h-1.5 bg-gray-700 rounded-full mx-auto mb-1" />
        <div className="grid grid-cols-2 gap-1.5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 flex flex-col gap-1">
              <div className="w-full h-1 bg-gray-200 rounded-full" />
              <div className="w-4/5 h-1 bg-gray-200 rounded-full" />
              <div className="w-3/5 h-1 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-1 mt-1">
                <div className="w-4 h-4 rounded-full bg-blue-200" />
                <div className="flex-1 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'terms',
    label: 'Terms & Conditions',
    description: 'Legal text with optional signature block',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3 flex flex-col gap-1.5">
        <div className="w-2/5 h-2 bg-gray-800 rounded-full mb-1" />
        <div className="space-y-1">
          {[100, 95, 100, 80, 100].map((w, i) => (
            <div key={i} className="h-1 bg-gray-300 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-auto border-t border-dashed border-gray-300 pt-2 grid grid-cols-2 gap-2">
          <div className="h-px bg-gray-400" />
          <div className="h-px bg-gray-400" />
        </div>
      </div>
    ),
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Bold closing section to prompt next steps',
    preview: (
      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg h-full flex flex-col items-center justify-center gap-1.5 p-3">
        <div className="w-2/3 h-2 bg-white/80 rounded-full" />
        <div className="w-1/2 h-1.5 bg-white/50 rounded-full" />
        <div className="mt-1 w-16 h-4 bg-white/90 rounded-full" />
      </div>
    ),
  },
]

interface Props {
  onAdd: (type: SectionType) => void
  onClose: () => void
}

export default function SectionPicker({ onAdd, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Add a Block</h2>
            <p className="text-sm text-gray-400">Choose a block type to add to your proposal</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {SECTION_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => { onAdd(opt.type); onClose() }}
                className="group text-left rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50 transition-all overflow-hidden"
              >
                <div className="h-28 bg-gray-50 p-2">
                  {opt.preview}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
