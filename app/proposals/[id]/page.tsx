'use client'
import { useState, useEffect, useCallback, use, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import type { Section, SectionType, UploadRecord } from '@/lib/types'
import { createDefaultSection, formatBytes, SECTION_LABELS } from '@/lib/utils'
import SectionEditorForm from '@/components/SectionEditorForm'
import ProposalRenderer from '@/components/ProposalRenderer'

const SectionPicker = lazy(() => import('@/components/SectionPicker'))

const THEMES = [
  { id: 'modern', label: 'Modern', color: '#3B82F6' },
  { id: 'bold', label: 'Bold', color: '#111827' },
  { id: 'classic', label: 'Classic', color: '#0D9488' },
]


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
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genDescription, setGenDescription] = useState('')
  const [showGenPanel, setShowGenPanel] = useState(false)
  const [showSectionPicker, setShowSectionPicker] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [uploading, setUploading] = useState(false)

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
      .catch(() => router.push('/'))
  }, [id, router])

  const save = useCallback(
    async (newSections: Section[], newTheme: string) => {
      setSaving(true)
      await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: newSections, theme: newTheme }),
      })
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    [id]
  )

  const handleSectionChange = (updated: Section) => {
    const next = sections.map((s) => (s.id === updated.id ? updated : s))
    setSections(next)
    save(next, theme)
  }

  const handleThemeChange = (t: string) => {
    setTheme(t)
    save(sections, t)
  }

  const addSection = (type: SectionType) => {
    const s = createDefaultSection(type)
    const next = [...sections, s]
    setSections(next)
    setSelectedSection(s.id)
    save(next, theme)
  }

  const removeSection = (sectionId: string) => {
    const next = sections.filter((s) => s.id !== sectionId)
    setSections(next)
    if (selectedSection === sectionId) setSelectedSection(null)
    save(next, theme)
  }

  const moveSection = (sectionId: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === sectionId)
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === sections.length - 1)) return
    const next = [...sections]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setSections(next)
    save(next, theme)
  }

  const handleGenerate = async () => {
    if (!genDescription.trim() && (!proposal?.uploads || proposal.uploads.length === 0)) return
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
        setSections(Array.isArray(parsed) ? parsed : [])
      } catch { /* ignore */ }
      setShowGenPanel(false)
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
    if (res.ok) setProposal((prev) => prev ? { ...prev, status: newStatus } : prev)
    setPublishing(false)
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true)
    for (const file of accepted) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/proposals/${id}/upload`, { method: 'POST', body: formData })
      if (res.ok) {
        const upload = await res.json()
        setProposal((prev) => prev ? { ...prev, uploads: [...prev.uploads, upload] } : prev)
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
    setProposal((prev) => prev ? { ...prev, uploads: prev.uploads.filter((u) => u.id !== uploadId) } : prev)
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selected = sections.find((s) => s.id === selectedSection) ?? null

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = `${appUrl}/p/${proposal.slug}`

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <Link href="/" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{proposal.title}</p>
            {proposal.clientName && <p className="text-xs text-gray-400 truncate">for {proposal.clientName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <Link href="/library" className="text-gray-500 hover:text-violet-600 transition-colors flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-violet-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Library
          </Link>
          {saving && <span className="text-xs text-gray-400">Saving…</span>}
          {saved && <span className="text-xs text-green-500">Saved ✓</span>}

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setActiveTab('edit')} className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Edit</button>
            <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Preview</button>
          </div>

          {proposal.status === 'published' && (
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Live
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

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'edit' ? (
          <>
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
              <div className="flex-1 overflow-y-auto">
                {/* AI Generate */}
                <div className="p-4 border-b border-gray-100">
                  <button
                    onClick={() => setShowGenPanel(!showGenPanel)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    ✨ AI Generate
                  </button>
                  {showGenPanel && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                        placeholder="Describe what to generate, or use uploaded files..."
                        value={genDescription}
                        onChange={(e) => setGenDescription(e.target.value)}
                      />
                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {generating ? 'Generating…' : 'Generate Sections'}
                      </button>
                      <p className="text-xs text-gray-400 text-center">This will replace current sections</p>
                    </div>
                  )}
                </div>

                {/* Sections List */}
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Sections</p>
                  {sections.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No sections. Add one or use AI.</p>
                  ) : (
                    <div className="space-y-1">
                      {sections.map((s, i) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSection(s.id)}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedSection === s.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          <span className="text-xs flex-1 truncate font-medium">{SECTION_LABELS[s.type]}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'up') }} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'down') }} disabled={i === sections.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeSection(s.id) }} className="text-gray-400 hover:text-red-500 p-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Section button */}
                  <button
                    onClick={() => setShowSectionPicker(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Section
                  </button>
                </div>

                {/* Theme */}
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Theme</p>
                  <div className="flex gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        title={t.label}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${theme === t.id ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ background: t.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Files */}
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Uploaded Files</p>
                  {proposal.uploads.length === 0 && (
                    <p className="text-xs text-gray-400 mb-2">No files uploaded</p>
                  )}
                  {proposal.uploads.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 mb-1 group">
                      <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-600 flex-1 truncate">{u.filename}</span>
                      <button onClick={() => deleteUpload(u.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <div {...getRootProps()} className="mt-2 border border-dashed border-gray-200 rounded-lg p-2 text-center cursor-pointer hover:border-gray-300 transition-colors">
                    <input {...getInputProps()} />
                    <p className="text-xs text-gray-400">{uploading ? 'Uploading…' : '+ Upload more files'}</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Editor / Preview split */}
            <div className="flex flex-1 overflow-hidden">
              {/* Section Form */}
              <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
                {selected ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-gray-900">{SECTION_LABELS[selected.type]}</h3>
                      <button onClick={() => setSelectedSection(null)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <SectionEditorForm section={selected} onChange={handleSectionChange} proposalId={id} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center px-6">
                    <div>
                      <svg className="w-8 h-8 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p>Select a section to edit its content</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview */}
              <div className="flex-1 overflow-y-auto bg-gray-100">
                <div className="bg-white min-h-full shadow-sm">
                  <ProposalRenderer sections={sections} theme={theme} />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Full Preview Tab */
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white min-h-full">
              <ProposalRenderer sections={sections} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {showSectionPicker && (
        <Suspense fallback={null}>
          <SectionPicker
            onAdd={(type: SectionType) => addSection(type)}
            onClose={() => setShowSectionPicker(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
