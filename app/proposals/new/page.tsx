'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { formatBytes } from '@/lib/utils'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  uploadId?: string
}

export default function NewProposalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [step, setStep] = useState<'info' | 'generating'>('info')
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted.map((f) => ({ file: f, status: 'pending' as const }))])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024,
  })

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const handleScratch = async () => {
    if (!title.trim()) { setError('Please enter a proposal title.'); return }
    setError('')
    setStep('generating')
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), clientName: clientName.trim(), clientEmail: clientEmail.trim() }),
      })
      if (!res.ok) throw new Error('Failed to create proposal')
      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStep('info')
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Please enter a proposal title.'); return }
    if (!description.trim() && files.length === 0) { setError('Please add a description or upload at least one file.'); return }
    setError('')
    setStep('generating')

    try {
      // 1. Create proposal
      const createRes = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), clientName: clientName.trim(), clientEmail: clientEmail.trim() }),
      })
      if (!createRes.ok) throw new Error('Failed to create proposal')
      const proposal = await createRes.json()

      // 2. Upload files
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f))
        const formData = new FormData()
        formData.append('file', files[i].file)
        const uploadRes = await fetch(`/api/proposals/${proposal.id}/upload`, { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: uploadRes.ok ? 'done' : 'error', uploadId: uploadData.id } : f))
      }

      // 3. AI generate
      const genRes = await fetch(`/api/proposals/${proposal.id}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })

      if (!genRes.ok) {
        const err = await genRes.json()
        // AI failed but proposal exists — go to editor anyway
        console.warn('AI generation failed:', err.error)
      }

      router.push(`/proposals/${proposal.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStep('info')
    }
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generating your proposal…</h2>
          <p className="text-gray-500 text-sm">
            {files.length > 0 ? 'Uploading files and extracting content' : 'AI is crafting your proposal sections'}
          </p>
          <div className="mt-6 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm bg-white rounded-lg px-4 py-2 border border-gray-100">
                <span className="flex-1 truncate text-gray-700">{f.file.name}</span>
                <span className={f.status === 'done' ? 'text-green-500' : f.status === 'error' ? 'text-red-500' : 'text-blue-500'}>
                  {f.status === 'done' ? '✓' : f.status === 'error' ? '✗' : '…'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">ProposalCraft</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Proposal</h1>
          <p className="text-gray-500 mt-1">Fill in the details and let AI generate a beautiful proposal</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Title *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Website Redesign Proposal for Acme Corp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="client@acme.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief Description <span className="text-gray-400 font-normal">(for AI generation)</span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              placeholder="Describe what this proposal is about. What service are you offering? Who is the client? What are the goals? The more detail you provide, the better the AI-generated proposal will be."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files <span className="text-gray-400 font-normal">(optional — PDF, DOCX, TXT)</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT up to 10MB each</p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-700 flex-1 truncate">{f.file.name}</span>
                    <span className="text-xs text-gray-400">{formatBytes(f.file.size)}</span>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleScratch}
              className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Build Manually
            </button>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Generate with AI
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
