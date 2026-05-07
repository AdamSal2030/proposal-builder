'use client'
import { useState } from 'react'
import type { Section, SectionType, HeroData, TextBlockData, FeaturesData, FeatureItem, TimelineData, TimelineItem, PricingData, PricingTier, TeamData, TeamMember, CTAData } from '@/lib/types'

interface Props {
  section: Section
  onChange: (updated: Section) => void
  proposalId: string
}

function Field({ label, value, onChange, textarea = false, placeholder = '' }: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
  placeholder?: string
}) {
  const cls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {textarea
        ? <textarea className={`${cls} min-h-[100px] resize-y`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function HeroEditor({ data, onChange }: { data: HeroData; onChange: (d: HeroData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} textarea />
      <Field label="Button Text" value={data.buttonText} onChange={(v) => onChange({ ...data, buttonText: v })} />
    </div>
  )
}

function TextBlockEditor({ data, onChange }: { data: TextBlockData; onChange: (d: TextBlockData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Content" value={data.content} onChange={(v) => onChange({ ...data, content: v })} textarea placeholder="Write your content here..." />
    </div>
  )
}

function FeaturesEditor({ data, onChange }: { data: FeaturesData; onChange: (d: FeaturesData) => void }) {
  const updateItem = (i: number, patch: Partial<FeatureItem>) => {
    const items = data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    onChange({ ...data, items })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { title: 'New Feature', description: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <div className="space-y-3">
        {data.items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
            </div>
            <Field label="Title" value={item.title} onChange={(v) => updateItem(i, { title: v })} />
            <Field label="Description" value={item.description} onChange={(v) => updateItem(i, { description: v })} textarea />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
        + Add Feature
      </button>
    </div>
  )
}

function TimelineEditor({ data, onChange }: { data: TimelineData; onChange: (d: TimelineData) => void }) {
  const updateItem = (i: number, patch: Partial<TimelineItem>) => {
    const items = data.items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    onChange({ ...data, items })
  }
  const addItem = () => onChange({ ...data, items: [...data.items, { phase: 'New Phase', duration: '', description: '' }] })
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
            <Field label="Phase Name" value={item.phase} onChange={(v) => updateItem(i, { phase: v })} />
            <Field label="Duration" value={item.duration} onChange={(v) => updateItem(i, { duration: v })} placeholder="e.g. 2 weeks" />
          </div>
          <Field label="Description" value={item.description} onChange={(v) => updateItem(i, { description: v })} textarea />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
        + Add Phase
      </button>
    </div>
  )
}

function PricingEditor({ data, onChange }: { data: PricingData; onChange: (d: PricingData) => void }) {
  const updateTier = (i: number, patch: Partial<PricingTier>) => {
    const tiers = data.tiers.map((t, idx) => idx === i ? { ...t, ...patch } : t)
    onChange({ ...data, tiers })
  }
  const updateFeatures = (i: number, raw: string) => {
    updateTier(i, { features: raw.split('\n').filter(Boolean) })
  }
  const addTier = () => onChange({ ...data, tiers: [...data.tiers, { name: 'New Tier', price: '$0', period: '/month', features: ['Feature A'] }] })
  const removeTier = (i: number) => onChange({ ...data, tiers: data.tiers.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      {data.tiers.map((tier, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Tier {i + 1}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={!!tier.highlighted} onChange={(e) => updateTier(i, { highlighted: e.target.checked })} />
                Highlighted
              </label>
              <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Name" value={tier.name} onChange={(v) => updateTier(i, { name: v })} />
            <Field label="Price" value={tier.price} onChange={(v) => updateTier(i, { price: v })} placeholder="$999" />
            <Field label="Period" value={tier.period ?? ''} onChange={(v) => updateTier(i, { period: v })} placeholder="/month" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Features (one per line)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
              value={tier.features.join('\n')}
              onChange={(e) => updateFeatures(i, e.target.value)}
              placeholder="Feature A&#10;Feature B&#10;Feature C"
            />
          </div>
        </div>
      ))}
      <button onClick={addTier} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
        + Add Tier
      </button>
    </div>
  )
}

function TeamEditor({ data, onChange }: { data: TeamData; onChange: (d: TeamData) => void }) {
  const updateMember = (i: number, patch: Partial<TeamMember>) => {
    const members = data.members.map((m, idx) => idx === i ? { ...m, ...patch } : m)
    onChange({ ...data, members })
  }
  const addMember = () => onChange({ ...data, members: [...data.members, { name: 'New Member', role: '', bio: '' }] })
  const removeMember = (i: number) => onChange({ ...data, members: data.members.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Section Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      {data.members.map((m, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-gray-500">Member {i + 1}</span>
            <button onClick={() => removeMember(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={m.name} onChange={(v) => updateMember(i, { name: v })} />
            <Field label="Role" value={m.role} onChange={(v) => updateMember(i, { role: v })} />
          </div>
          <Field label="Bio" value={m.bio} onChange={(v) => updateMember(i, { bio: v })} textarea />
        </div>
      ))}
      <button onClick={addMember} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
        + Add Member
      </button>
    </div>
  )
}

function CTAEditor({ data, onChange }: { data: CTAData; onChange: (d: CTAData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <Field label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} textarea />
      <Field label="Button Text" value={data.buttonText} onChange={(v) => onChange({ ...data, buttonText: v })} />
    </div>
  )
}

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
      case 'summary':
      case 'problem':
      case 'solution':
        return <TextBlockEditor data={section.data as TextBlockData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'features':
        return <FeaturesEditor data={section.data as FeaturesData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'timeline':
        return <TimelineEditor data={section.data as TimelineData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'pricing':
        return <PricingEditor data={section.data as PricingData} onChange={(d) => onChange({ ...section, data: d })} />
      case 'team':
        return <TeamEditor data={section.data as TeamData} onChange={(d) => onChange({ ...section, data: d })} />
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
            placeholder="e.g. Make it more concise and persuasive"
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
