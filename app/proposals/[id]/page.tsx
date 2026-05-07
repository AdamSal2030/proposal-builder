'use client'
import { useState, useEffect, useCallback, useRef, use, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import type { Section, SectionType, UploadRecord } from '@/lib/types'
import { createDefaultSection, formatBytes, SECTION_LABELS } from '@/lib/utils'
import SectionEditorForm from '@/components/SectionEditorForm'
import EditorCanvas from '@/components/EditorCanvas'

const SectionPicker = lazy(() => import('@/components/SectionPicker'))

const THEMES = [
  { id: 'modern', label: 'Modern', color: '#3B82F6' },
  { id: 'bold', label: 'Bold', color: '#111827' },
  { id: 'classic', label: 'Classic', color: '#0D9488' },
]

const SECTION_DOT: Record<string, string> = {
  cover: 'bg-violet-500', hero: 'bg-blue-500', summary: 'bg-sky-500',
  about: 'bg-teal-500', scope: 'bg-green-500', specs: 'bg-amber-500',
  gallery: 'bg-orange-500', investment: 'bg-emerald-600', timeline: 'bg-indigo-500',
  testimonials: 'bg-pink-500', terms: 'bg-gray-400', cta: 'bg-purple-500',
}

interface ProposalData {
  id: string
  title: string
  slug: string
  status: string
  theme: string
  clientName: string | null
  clientEmail: string | null
  sections: string
  uploads: UploadRecord[]
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [theme, setTheme] = useState('modern')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)
  // insertIndex: null = picker closed, number = insert at this position
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [showAI, setShowAI] = useState(false)
  const [genDescription, setGenDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragSrcId = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((r) => r.json())
      .then((data: ProposalData) => {
        setProposal(data)
        setTheme(data.theme)
        try {
          const parsed = JSON.parse(data.sections)
          setSections(Array.isArray(parsed) ? parsed : [])
        } catch { setSections([]) }
      })
      .catch(() => router.push('/' as string))
  }, [id, router])

  const save = useCallback(async (s: Section[], t: string) => {
    setSaving(true)
    await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: s, theme: t }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [id])

  const debouncedSave = useCallback((s: Section[], t: string) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(s, t), 800)
  }, [save])

  const handleSectionChange = useCallback((updated: Section) => {
    setSections((prev) => {
      const next = prev.map((s) => s.id === updated.id ? updated : s)
      debouncedSave(next, theme)
      return next
    })
  }, [debouncedSave, theme])

  const handleThemeChange = (t: string) => {
    setTheme(t)
    debouncedSave(sections, t)
  }

  // Insert a new section at a specific index (from InsertBar or Add Block button)
  const addSection = (type: SectionType) => {
    const s = createDefaultSection(type)
    const pos = insertIndex ?? sections.length
    const next = [...sections.slice(0, pos), s, ...sections.slice(pos)]
    setSections(next)
    setSelectedId(s.id)
    setInsertIndex(null)
    debouncedSave(next, theme)
    setTimeout(() => {
      document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const removeSection = (sectionId: string) => {
    const next = sections.filter((s) => s.id !== sectionId)
    setSections(next)
    if (selectedId === sectionId) setSelectedId(null)
    debouncedSave(next, theme)
  }

  const moveSection = (sectionId: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === sectionId)
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === sections.length - 1)) return
    const next = [...sections]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setSections(next)
    debouncedSave(next, theme)
  }

  // Drag-to-reorder in sidebar
  const handleDragStart = (id: string) => { dragSrcId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop = (targetId: string) => {
    if (!dragSrcId.current || dragSrcId.current === targetId) { setDragOverId(null); return }
    const srcIdx = sections.findIndex((s) => s.id === dragSrcId.current)
    const tgtIdx = sections.findIndex((s) => s.id === targetId)
    const next = [...sections]
    const [moved] = next.splice(srcIdx, 1)
    next.splice(tgtIdx, 0, moved)
    setSections(next)
    debouncedSave(next, theme)
    dragSrcId.current = null
    setDragOverId(null)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await fetch(`/api/proposals/${id}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: genDescription }),
    })
    const data = await res.json()
    if (res.ok) {
      try {
        const parsed = JSON.parse(data.sections)
        if (Array.isArray(parsed)) { setSections(parsed); setSelectedId(null) }
      } catch { /* noop */ }
      setShowAI(false)
      setGenDescription('')
    }
    setGenerating(false)
  }

  const handlePublish = async () => {
    setPublishing(true)
    const newStatus = proposal?.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) setProposal((p) => p ? { ...p, status: newStatus } : p)
    setPublishing(false)
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true)
    for (const file of accepted) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/proposals/${id}/upload`, { method: 'POST', body: fd })
      if (res.ok) {
        const upload = await res.json()
        setProposal((p) => p ? { ...p, uploads: [...p.uploads, upload] } : p)
      }
    }
    setUploading(false)
  }, [id])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxSize: 10 * 1024 * 1024,
  })

  const deleteUpload = async (uploadId: string) => {
    await fetch(`/api/proposals/${id}/upload?uploadId=${uploadId}`, { method: 'DELETE' })
    setProposal((p) => p ? { ...p, uploads: p.uploads.filter((u) => u.id !== uploadId) } : p)
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selected = sections.find((s) => s.id === selectedId) ?? null
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${proposal.slug}`

  return (
    <div className="h-screen flex flex-col bg-[#F0F0F0] overflow-hidden">
      {/* ── Top bar ── */}
      <header className="h-14 bg-white border-b border-gray-100 px-4 flex items-center gap-3 flex-shrink-0 z-20 shadow-sm">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{proposal.title}</p>
          {proposal.clientName && <p className="text-xs text-gray-400 hidden sm:block truncate">· {proposal.clientName}</p>}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className="w-16 text-right">
            {saving && <span className="text-xs text-gray-400">Saving…</span>}
            {!saving && saved && <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>}
          </div>

          <Link href="/library" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-50 hidden md:flex items-center gap-1.5">
            Library
          </Link>

          <a
            href={`/proposals/${id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-1.5"
          >
            Preview
          </a>

          {proposal.status === 'published' && (
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              Live ↗
            </a>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              proposal.status === 'published'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {publishing ? '…' : proposal.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="w-48 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-10">
          <div className="p-2.5 border-b border-gray-100">
            <button
              onClick={() => setInsertIndex(sections.length)}
              className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Block
            </button>
          </div>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
            {sections.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 px-2 leading-relaxed">No blocks yet.<br />Click "Add Block" or use the + buttons on the canvas.</p>
            ) : (
              <div className="space-y-px">
                {sections.map((s) => {
                  const dot = SECTION_DOT[s.type] ?? 'bg-gray-400'
                  const label = SECTION_LABELS[s.type] ?? s.type
                  const isActive = selectedId === s.id
                  const isDragTarget = dragOverId === s.id

                  return (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={() => handleDragStart(s.id)}
                      onDragOver={(e) => handleDragOver(e, s.id)}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={() => handleDrop(s.id)}
                      onClick={() => setSelectedId(isActive ? null : s.id)}
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all select-none ${
                        isActive ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'
                      } ${isDragTarget ? 'border-t-2 border-black' : ''}`}
                    >
                      <svg className="w-2.5 h-2.5 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                      </svg>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : dot}`} />
                      <span className="text-[11px] font-medium flex-1 truncate">{label}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(s.id) }}
                        className={`opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isActive ? 'text-white/60 hover:text-white' : 'text-gray-300 hover:text-red-500'}`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom tools */}
          <div className="border-t border-gray-100">
            {/* AI Generate */}
            <div className="p-2.5 border-b border-gray-100">
              <button
                onClick={() => setShowAI(!showAI)}
                className="w-full flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors py-1"
              >
                ✨ AI Generate
                <svg className={`w-3 h-3 ml-auto transition-transform ${showAI ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAI && (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-black min-h-[60px] resize-none"
                    placeholder="Describe the proposal…"
                    value={genDescription}
                    onChange={(e) => setGenDescription(e.target.value)}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-black text-white py-1.5 rounded-lg text-[11px] font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    {generating ? 'Generating…' : 'Generate All Blocks'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Replaces all existing blocks</p>
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="px-2.5 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme</p>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    title={t.label}
                    className={`w-6 h-6 rounded-full transition-all ${theme === t.id ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                    style={{ background: t.color }}
                  />
                ))}
              </div>
            </div>

            {/* Files */}
            <div className="px-2.5 py-2">
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="w-full flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              >
                Files ({proposal.uploads.length})
                <svg className={`w-3 h-3 ml-auto transition-transform ${showFiles ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showFiles && (
                <div className="mt-2 space-y-1">
                  {proposal.uploads.map((u) => (
                    <div key={u.id} className="flex items-center gap-1.5 group">
                      <span className="text-[10px] text-gray-500 flex-1 truncate">{u.filename}</span>
                      <button onClick={() => deleteUpload(u.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <div {...getRootProps()} className="border border-dashed border-gray-200 rounded-lg p-2 text-center cursor-pointer hover:border-gray-400 transition-colors">
                    <input {...getInputProps()} />
                    <p className="text-[10px] text-gray-400">{uploading ? 'Uploading…' : '+ Upload file'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main
          className="flex-1 overflow-y-auto relative"
          style={{ background: '#E8E8E8' }}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-w-5xl mx-auto my-6 bg-white shadow-xl shadow-black/10 rounded-xl overflow-hidden min-h-[calc(100vh-80px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <EditorCanvas
              sections={sections}
              theme={theme}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              onMove={moveSection}
              onRemove={removeSection}
              onUpdate={handleSectionChange}
              onInsertAt={(index) => setInsertIndex(index)}
            />
          </div>
        </main>

        {/* ── Right editor panel ── */}
        <aside
          className={`border-l border-gray-100 bg-white flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden ${
            selected ? 'w-72' : 'w-0'
          }`}
        >
          {selected && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${SECTION_DOT[selected.type] ?? 'bg-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900 text-sm">{SECTION_LABELS[selected.type] ?? selected.type}</h3>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SectionEditorForm
                  section={selected}
                  onChange={handleSectionChange}
                  proposalId={id}
                />
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Section picker modal */}
      {insertIndex !== null && (
        <Suspense fallback={null}>
          <SectionPicker
            onAdd={addSection}
            onClose={() => setInsertIndex(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
