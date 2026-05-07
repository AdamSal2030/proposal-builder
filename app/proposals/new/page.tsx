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
  const [mode, setMode] = useState<'manual' | 'ai'>('ai')

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

  const createProposal = async () => {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), clientName: clientName.trim(), clientEmail: clientEmail.trim() }),
    })
    if (!res.ok) throw new Error('Failed to create proposal')
    return res.json()
  }

  const handleManual = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return }
    setError('')
    setStep('generating')
    try {
      const proposal = await createProposal()
      router.push(`/proposals/${proposal.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('info')
    }
  }

  const handleAI = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!description.trim() && files.length === 0) { setError('Add a description or upload files for AI to work with.'); return }
    setError('')
    setStep('generating')
    try {
      const proposal = await createProposal()

      for (let i = 0; i < files.length; i++) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f))
        const formData = new FormData()
        formData.append('file', files[i].file)
        const uploadRes = await fetch(`/api/proposals/${proposal.id}/upload`, { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: uploadRes.ok ? 'done' : 'error', uploadId: uploadData.id } : f))
      }

      const genRes = await fetch(`/api/proposals/${proposal.id}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })
      if (!genRes.ok) console.warn('AI generation failed')

      router.push(`/proposals/${proposal.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('info')
    }
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mx-auto mb-5">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">
            {mode === 'ai' ? 'Generating your proposal…' : 'Creating proposal…'}
          </p>
          <p className="text-sm text-gray-400">This will only take a moment</p>
          {files.length > 0 && (
            <div className="mt-5 space-y-1.5 text-left">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                  <span className="flex-1 truncate text-gray-600">{f.file.name}</span>
                  <span className={f.status === 'done' ? 'text-emerald-500' : f.status === 'error' ? 'text-red-400' : 'text-gray-300'}>
                    {f.status === 'done' ? '✓' : f.status === 'error' ? '✗' : '…'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">ProposalCraft</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">New Proposal</h1>
          <p className="text-gray-400 text-sm">Start blank or generate with AI</p>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Proposal title *</label>
            <input
              autoFocus
              className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
              placeholder="e.g. Toyota Land Cruiser Sales Proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Client */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Client name</label>
              <input
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                placeholder="Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Client email</label>
              <input
                type="email"
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                placeholder="client@acme.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 grid grid-cols-2 gap-1">
            <button
              onClick={() => setMode('ai')}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${mode === 'ai' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Start blank
            </button>
          </div>

          {mode === 'ai' && (
            <>
              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Describe the proposal</label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all min-h-[120px] resize-y"
                  placeholder="What is this proposal about? What are you offering, and to whom? The more detail you give, the better the output."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Upload files <span className="text-gray-300 font-normal">(optional — PDF, DOCX, TXT)</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-gray-400">
                    {isDragActive ? 'Drop files here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Up to 10MB each</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                        <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-600 flex-1 truncate">{f.file.name}</span>
                        <span className="text-xs text-gray-300">{formatBytes(f.file.size)}</span>
                        <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {mode === 'ai' ? (
            <button
              onClick={() => { setMode('ai'); handleAI() }}
              className="w-full bg-black text-white font-medium py-3 rounded-xl text-sm hover:bg-gray-900 transition-colors"
            >
              Generate Proposal
            </button>
          ) : (
            <button
              onClick={handleManual}
              className="w-full bg-black text-white font-medium py-3 rounded-xl text-sm hover:bg-gray-900 transition-colors"
            >
              Create Blank Proposal
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
