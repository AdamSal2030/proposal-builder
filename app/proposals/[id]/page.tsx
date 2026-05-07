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

const SECTION_ICONS: Record<string, string> = {
  cover: '📄', hero: '🖼️', summary: '📝', about: '👤',
  scope: '✅', specs: '📊', gallery: '🖼️', investment: '💰',
  timeline: '📅', testimonials: '💬', terms: '📋', cta: '🎯',
}

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
  const [showSectionPicker, setShowSectionPicker] = useState(false)
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

  const handleSectionChange = (updated: Section) => {
    const next = sections.map((s) => s.id === updated.id ? updated : s)
    setSections(next)
    debouncedSave(next, theme)
  }

  const handleThemeChange = (t: string) => {
    setTheme(t)
    debouncedSave(sections, t)
  }

  const addSection = (type: SectionType) => {
    const s = createDefaultSection(type)
    const next = [...sections, s]
    setSections(next)
    setSelectedId(s.id)
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
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selected = sections.find((s) => s.id === selectedId) ?? null
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${proposal.slug}`

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* ── Top bar ── */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center gap-3 flex-shrink-0 z-20">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{proposal.title}</p>
          {proposal.clientName && <p className="text-xs text-gray-400 hidden sm:block truncate">· {proposal.clientName}</p>}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Save indicator */}
          <div className="w-20 text-right">
            {saving && <span className="text-xs text-gray-400">Saving…</span>}
            {!saving && saved && <span className="text-xs text-green-500 font-medium">Saved ✓</span>}
          </div>

          <Link href="/library" className="text-gray-500 hover:text-violet-600 transition-colors text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-violet-50 hidden md:flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Library
          </Link>

          <a
            href={`/proposals/${id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </a>

          {proposal.status === 'published' && (
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live
            </a>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              proposal.status === 'published'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {publishing ? '…' : proposal.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
          {/* Add block */}
          <div className="p-3 border-b border-gray-100">
            <button
              onClick={() => setShowSectionPicker(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Block
            </button>
          </div>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {sections.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 px-2">No blocks yet. Click "Add Block" above.</p>
            ) : (
              <div className="space-y-0.5">
                {sections.map((s, i) => {
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
                      className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all select-none ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                      } ${isDragTarget ? 'border-t-2 border-blue-400' : ''}`}
                    >
                      {/* Drag handle */}
                      <svg className="w-3 h-3 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                      </svg>

                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                      <span className="text-xs font-medium flex-1 truncate">{label}</span>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(s.id) }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom: AI + Theme + Files */}
          <div className="border-t border-gray-100">
            {/* AI Generate */}
            <div className="p-3 border-b border-gray-100">
              <button
                onClick={() => setShowAI(!showAI)}
                className="w-full flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors py-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                ✨ AI Generate
                <svg className={`w-3 h-3 ml-auto transition-transform ${showAI ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAI && (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] resize-none"
                    placeholder="Describe the proposal or upload files below…"
                    value={genDescription}
                    onChange={(e) => setGenDescription(e.target.value)}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {generating ? 'Generating…' : 'Generate All Blocks'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Replaces existing blocks</p>
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="px-3 py-2.5 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme</p>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    title={t.label}
                    className={`w-7 h-7 rounded-full transition-all ${theme === t.id ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                    style={{ background: t.color }}
                  />
                ))}
              </div>
            </div>

            {/* Files */}
            <div className="px-3 py-2.5">
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="w-full flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0"
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
                      <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] text-gray-500 flex-1 truncate">{u.filename}</span>
                      <button onClick={() => deleteUpload(u.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <div {...getRootProps()} className="mt-1.5 border border-dashed border-gray-200 rounded-lg p-2 text-center cursor-pointer hover:border-blue-300 transition-colors">
                    <input {...getInputProps()} />
                    <p className="text-[10px] text-gray-400">{uploading ? 'Uploading…' : '+ Upload file'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main className="flex-1 overflow-y-auto bg-gray-200/70 relative">
          <div className="max-w-5xl mx-auto my-6 bg-white shadow-2xl shadow-black/10 rounded-2xl overflow-hidden min-h-[calc(100vh-80px)]">
            <EditorCanvas
              sections={sections}
              theme={theme}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
              onMove={moveSection}
              onRemove={removeSection}
            />
          </div>
        </main>

        {/* ── Right editor panel (slides in) ── */}
        <aside
          className={`border-l border-gray-200 bg-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            selected ? 'w-80' : 'w-0'
          }`}
        >
          {selected && (
            <>
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${SECTION_DOT[selected.type] ?? 'bg-gray-400'}`} />
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

              {/* Editor form */}
              <div className="flex-1 overflow-y-auto p-5">
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
      {showSectionPicker && (
        <Suspense fallback={null}>
          <SectionPicker
            onAdd={addSection}
            onClose={() => setShowSectionPicker(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
