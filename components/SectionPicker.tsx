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
    type: 'hero',
    label: 'Hero Banner',
    description: 'Full-width headline with background and CTA button',
    preview: (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg h-full flex flex-col items-center justify-center p-3 gap-1">
        <div className="w-3/4 h-2 bg-white/80 rounded-full" />
        <div className="w-1/2 h-1.5 bg-white/50 rounded-full" />
        <div className="mt-1 w-16 h-4 bg-white/90 rounded-full" />
      </div>
    ),
  },
  {
    type: 'summary',
    label: 'Executive Summary',
    description: 'Overview paragraph with a clear title',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="w-1/2 h-2 bg-gray-800 rounded-full" />
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-gray-200 rounded-full" />
          <div className="w-full h-1.5 bg-gray-200 rounded-full" />
          <div className="w-3/4 h-1.5 bg-gray-200 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    type: 'problem',
    label: 'Problem Statement',
    description: 'Describe the challenge your client faces',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="w-2/3 h-2 bg-gray-800 rounded-full" />
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-gray-300 rounded-full" />
          <div className="w-5/6 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-full h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    type: 'solution',
    label: 'Our Solution',
    description: 'Explain how you solve their problem',
    preview: (
      <div className="bg-white rounded-lg h-full p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-400 flex-shrink-0" />
          <div className="w-1/2 h-2 bg-gray-800 rounded-full" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-gray-200 rounded-full" />
          <div className="w-4/5 h-1.5 bg-gray-200 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    type: 'features',
    label: 'Key Features',
    description: 'Grid of features or services with descriptions',
    preview: (
      <div className="bg-white rounded-lg h-full p-3">
        <div className="w-1/3 h-1.5 bg-gray-800 rounded-full mx-auto mb-2" />
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded p-1.5 flex flex-col gap-1">
              <div className="w-4 h-4 rounded bg-blue-200" />
              <div className="w-full h-1 bg-gray-300 rounded-full" />
              <div className="w-3/4 h-1 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'timeline',
    label: 'Project Timeline',
    description: 'Phase-by-phase project roadmap',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3">
        <div className="w-1/3 h-1.5 bg-gray-800 rounded-full mb-2.5" />
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
    type: 'pricing',
    label: 'Pricing',
    description: 'Pricing tiers with feature lists',
    preview: (
      <div className="bg-white rounded-lg h-full p-3">
        <div className="w-1/4 h-1.5 bg-gray-800 rounded-full mx-auto mb-2" />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-gray-50 rounded p-1.5">
            <div className="w-1/2 h-1 bg-gray-400 rounded-full mb-1" />
            <div className="w-3/4 h-2 bg-gray-700 rounded-full mb-1" />
            <div className="space-y-0.5">
              <div className="w-full h-1 bg-gray-200 rounded-full" />
              <div className="w-2/3 h-1 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="bg-blue-600 rounded p-1.5">
            <div className="w-1/2 h-1 bg-white/60 rounded-full mb-1" />
            <div className="w-3/4 h-2 bg-white/90 rounded-full mb-1" />
            <div className="space-y-0.5">
              <div className="w-full h-1 bg-white/40 rounded-full" />
              <div className="w-2/3 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'team',
    label: 'Our Team',
    description: 'Team members with photos, roles and bios',
    preview: (
      <div className="bg-gray-50 rounded-lg h-full p-3">
        <div className="w-1/4 h-1.5 bg-gray-800 rounded-full mx-auto mb-2" />
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded p-1.5 flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400" />
              <div className="w-full h-1 bg-gray-300 rounded-full" />
              <div className="w-2/3 h-1 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Bold closing section with a contact button',
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Add a Section</h2>
            <p className="text-sm text-gray-400">Choose a section type to add to your proposal</p>
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
