'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import type {
  Section, SectionType,
  HeroData, CoverData, TextBlockData, ScopeData, ScopeItem,
  SpecsData, SpecItem, GalleryData, GalleryImage,
  InvestmentData, InvestmentItem, TimelineData, TimelineItem,
  TestimonialsData, TestimonialItem, TermsData, CTAData,
  BackgroundType,
} from '@/lib/types'
import ImageUploader from './ImageUploader'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

interface Props {
  section: Section
  onChange: (updated: Section) => void
  proposalId: string
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function RichField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <RichTextEditor value={value} onChange={onChange} />
    </div>
  )
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
      + {label}
    </button>
  )
}

// ──────────────── Hero ────────────────
function HeroEditor({ data, onChange }: { data: HeroData; onChange: (d: HeroData) => void }) {
  const bgType = data.backgroundType ?? 'gradient'
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <Field label="Button Text" value={data.buttonText} onChange={(v) => onChange({ ...data, buttonText: v })} />
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Background</label>
        <div className="flex gap-2">
          {(['gradient', 'image', 'video'] as BackgroundType[]).map((t) => (
            <button key={t} onClick={() => onChange({ ...data, backgroundType: t })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${bgType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {bgType === 'image' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Background Image</label>
          <ImageUploader value={data.backgroundImage} onChange={(url) => onChange({ ...data, backgroundImage: url })} label="Upload Hero Image" />
        </div>
      )}
      {bgType === 'video' && (
        <div className="space-y-3">
          <Field label="Video URL (YouTube or Vimeo)" value={data.backgroundVideo ?? ''} onChange={(v) => onChange({ ...data, backgroundVideo: v })} placeholder="https://www.youtube.com/watch?v=..." />
          <p className="text-xs text-gray-400 text-center">— or upload a video file —</p>
          <ImageUploader value={data.backgroundVideo?.startsWith('/') ? data.backgroundVideo : undefined} onChange={(url) => onChange({ ...data, backgroundVideo: url })} accept="image+video" label="Upload MP4/WebM" />
        </div>
      )}
      {bgType !== 'gradient' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Overlay Opacity — {data.overlayOpacity ?? 50}%</label>
          <input type="range" min={0} max={90} step={5} value={data.overlayOpacity ?? 50} onChange={(e) => onChange({ ...data, overlayOpacity: Number(e.target.value) })} className="w-full accent-blue-600" />
        </div>
      )}
    </div>
  )
}

// ──────────────── Cover ────────────────
function CoverEditor({ data, onChange }: { data: CoverData; onChange: (d: CoverData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Proposal Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} placeholder="e.g. Toyota Land Cruiser 2024 — Sales Proposal" />
      <Field label="Subtitle" value={data.subtitle ?? ''} onChange={(v) => onChange({ ...data, subtitle: v })} placeholder="A tailored proposal prepared exclusively for you" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prepared For" value={data.preparedFor} onChange={(v) => onChange({ ...data, preparedFor: v })} placeholder="Client Name" />
        <Field label="Prepared By" value={data.preparedBy} onChange={(v) => onChange({ ...data, preparedBy: v })} placeholder="Your Company" />
      </div>
      <Field label="Date" value={data.date} onChange={(v) => onChange({ ...data, date: v })} placeholder="May 2026" />
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Logo (optional)</label>
        <ImageUploader value={data.logo} onChange={(url) => onChange({ ...data, logo: url })} label="Upload Logo" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Background Image (optional)</label>
        <ImageUploader value={data.backgroundImage} onChange={(url) => onChange({ ...data, backgroundImage: url })} label="Upload Background" />
      </div>
    </div>
  )
}

// ──────────────── Text block (summary / about) ────────────────
function TextBlockEditor({ data, onChange }: { data: TextBlockData; onChange: (d: TextBlockData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <RichField label="Content" value={data.content} onChange={(v) => onChange({ ...data, content: v })} />
    </div>
  )
}

// ──────────────── Scope ────────────────
function ScopeEditor({ data, onChange }: { data: ScopeData; onChange: (d: ScopeData) => void }) {
  const updateItem = (i: number, patch: Partial<ScopeItem>) => {
    onChange({ ...data, items: data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  }
  const addItem = (included: boolean) => onChange({ ...data, items: [...data.items, { text: '', included }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <RichField label="Intro (optional)" value={data.intro ?? ''} onChange={(v) => onChange({ ...data, intro: v })} />

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Items</label>
        {data.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => updateItem(i, { included: !item.included })}
              className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-colors ${item.included ? 'border-green-500 bg-green-50 text-green-600' : 'border-red-300 bg-red-50 text-red-400'}`}
            >
              {item.included ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={item.text}
              onChange={(e) => updateItem(i, { text: e.target.value })}
              placeholder={item.included ? 'Included item…' : 'Excluded item…'}
            />
            <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          <AddBtn label="Add Included" onClick={() => addItem(true)} />
          <AddBtn label="Add Excluded" onClick={() => addItem(false)} />
        </div>
      </div>
    </div>
  )
}

// ──────────────── Specs ────────────────
function SpecsEditor({ data, onChange }: { data: SpecsData; onChange: (d: SpecsData) => void }) {
  const updateItem = (i: number, patch: Partial<SpecItem>) => {
    onChange({ ...data, items: data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { label: '', value: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} placeholder="Specifications" />
      <Field label="Subtitle (optional)" value={data.subtitle ?? ''} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Side Image (optional)</label>
        <ImageUploader value={data.image} onChange={(url) => onChange({ ...data, image: url })} label="Upload image" />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Spec Rows</label>
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input className="w-1/3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Label" value={item.label} onChange={(e) => updateItem(i, { label: e.target.value })} />
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Value" value={item.value} onChange={(e) => updateItem(i, { value: e.target.value })} />
            <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <AddBtn label="Add Row" onClick={addItem} />
      </div>
    </div>
  )
}

// ──────────────── Gallery ────────────────
function GalleryEditor({ data, onChange }: { data: GalleryData; onChange: (d: GalleryData) => void }) {
  const updateImage = (i: number, patch: Partial<GalleryImage>) => {
    onChange({ ...data, images: data.images.map((img, idx) => idx === i ? { ...img, ...patch } : img) })
  }
  const addImage = () => onChange({ ...data, images: [...data.images, { url: '', caption: '' }] })
  const removeImage = (i: number) => onChange({ ...data, images: data.images.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Subtitle (optional)" value={data.subtitle ?? ''} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Photos ({data.images.length} — layout auto-adjusts)
        </label>
        {data.images.map((img, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-medium">Photo {i + 1}</span>
              <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
            </div>
            <ImageUploader value={img.url} onChange={(url) => updateImage(i, { url })} label="Upload photo" />
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Caption (optional)" value={img.caption ?? ''} onChange={(e) => updateImage(i, { caption: e.target.value })} />
          </div>
        ))}
        <AddBtn label="Add Photo" onClick={addImage} />
      </div>
    </div>
  )
}

// ──────────────── Investment ────────────────
function InvestmentEditor({ data, onChange }: { data: InvestmentData; onChange: (d: InvestmentData) => void }) {
  const updateItem = (i: number, patch: Partial<InvestmentItem>) => {
    onChange({ ...data, items: data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { description: '', amount: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} placeholder="Investment" />
      <RichField label="Intro (optional)" value={data.intro ?? ''} onChange={(v) => onChange({ ...data, intro: v })} />
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Line Items</label>
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
            <input className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="$0" value={item.amount} onChange={(e) => updateItem(i, { amount: e.target.value })} />
            <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <AddBtn label="Add Line Item" onClick={addItem} />
      </div>
      <Field label="Total" value={data.total} onChange={(v) => onChange({ ...data, total: v })} placeholder="$0" />
      <Field label="Quote Valid For" value={data.validity ?? ''} onChange={(v) => onChange({ ...data, validity: v })} placeholder="30 days" />
      <Field label="Notes (optional)" value={data.notes ?? ''} onChange={(v) => onChange({ ...data, notes: v })} placeholder="All prices are exclusive of tax." />
    </div>
  )
}

// ──────────────── Timeline ────────────────
function TimelineEditor({ data, onChange }: { data: TimelineData; onChange: (d: TimelineData) => void }) {
  const updateItem = (i: number, patch: Partial<TimelineItem>) => {
    onChange({ ...data, items: data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { phase: '', duration: '', description: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      {data.items.map((item, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-gray-500">Phase {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phase Name" value={item.phase} onChange={(v) => updateItem(i, { phase: v })} placeholder="Delivery" />
            <Field label="Duration" value={item.duration} onChange={(v) => updateItem(i, { duration: v })} placeholder="2 weeks" />
          </div>
          <Field label="Description" value={item.description} onChange={(v) => updateItem(i, { description: v })} />
        </div>
      ))}
      <AddBtn label="Add Phase" onClick={addItem} />
    </div>
  )
}

// ──────────────── Testimonials ────────────────
function TestimonialsEditor({ data, onChange }: { data: TestimonialsData; onChange: (d: TestimonialsData) => void }) {
  const updateItem = (i: number, patch: Partial<TestimonialItem>) => {
    onChange({ ...data, items: data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { quote: '', author: '', role: '', company: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      {data.items.map((item, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-gray-500">Testimonial {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Photo (optional)</label>
            <ImageUploader value={item.avatar} onChange={(url) => updateItem(i, { avatar: url })} label="Upload photo" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Quote</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y" value={item.quote} onChange={(e) => updateItem(i, { quote: e.target.value })} placeholder="What did this client say?" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Author" value={item.author} onChange={(v) => updateItem(i, { author: v })} placeholder="John Doe" />
            <Field label="Role" value={item.role ?? ''} onChange={(v) => updateItem(i, { role: v })} placeholder="CEO" />
            <Field label="Company" value={item.company ?? ''} onChange={(v) => updateItem(i, { company: v })} placeholder="Acme Corp" />
          </div>
        </div>
      ))}
      <AddBtn label="Add Testimonial" onClick={addItem} />
    </div>
  )
}

// ──────────────── Terms ────────────────
function TermsEditor({ data, onChange }: { data: TermsData; onChange: (d: TermsData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <RichField label="Terms Content" value={data.content} onChange={(v) => onChange({ ...data, content: v })} />
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onChange({ ...data, showSignature: !data.showSignature })}
          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${data.showSignature ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.showSignature ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm text-gray-700" onClick={() => onChange({ ...data, showSignature: !data.showSignature })}>Show signature block</span>
      </label>
    </div>
  )
}

// ──────────────── CTA ────────────────
function CTAEditor({ data, onChange }: { data: CTAData; onChange: (d: CTAData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <Field label="Button Text" value={data.buttonText} onChange={(v) => onChange({ ...data, buttonText: v })} />
    </div>
  )
}

// ──────────────── Main component ────────────────
export default function SectionEditorForm({ section, onChange, proposalId }: Props) {
  const [improving, setImproving] = useState(false)
  const [improveText, setImproveText] = useState('')
  const [improveError, setImproveError] = useState('')

  const handleImprove = async () => {
    if (!improveText.trim()) return
    setImproving(true)
    setImproveError('')
    try {
      const res = await fetch(`/api/proposals/${proposalId}/ai/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: section.type, currentData: section.data, instructions: improveText }),
      })
      const json = await res.json()
      if (!res.ok) { setImproveError(json.error || 'Failed'); return }
      onChange({ ...section, data: json.data })
      setImproveText('')
    } catch {
      setImproveError('Request failed')
    } finally {
      setImproving(false)
    }
  }

  const renderEditor = () => {
    switch (section.type as SectionType) {
      case 'hero':
        return <HeroEditor data={section.data as HeroData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'cover':
        return <CoverEditor data={section.data as CoverData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'summary':
      case 'about':
        return <TextBlockEditor data={section.data as TextBlockData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'scope':
        return <ScopeEditor data={section.data as ScopeData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'specs':
        return <SpecsEditor data={section.data as SpecsData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'gallery':
        return <GalleryEditor data={section.data as GalleryData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'investment':
        return <InvestmentEditor data={section.data as InvestmentData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'timeline':
        return <TimelineEditor data={section.data as TimelineData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'testimonials':
        return <TestimonialsEditor data={section.data as TestimonialsData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'terms':
        return <TermsEditor data={section.data as TermsData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'cta':
        return <CTAEditor data={section.data as CTAData} onChange={(d) => onChange({ ...section, data: d })} />
      default:
        return <p className="text-gray-400 text-sm">Unknown section type</p>
    }
  }

  return (
    <div className="space-y-6">
      {renderEditor()}

      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">✨ AI Improve</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Make it more persuasive and concise"
            value={improveText}
            onChange={(e) => setImproveText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImprove()}
          />
          <button
            onClick={handleImprove}
            disabled={improving || !improveText.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {improving ? 'Improving…' : 'Improve'}
          </button>
        </div>
        {improveError && <p className="text-red-500 text-xs mt-1">{improveError}</p>}
      </div>
    </div>
  )
}
