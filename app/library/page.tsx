'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { formatBytes, formatDate } from '@/lib/utils'

interface Asset {
  id: string
  filename: string
  url: string
  publicId: string
  width: number | null
  height: number | null
  format: string | null
  size: number
  createdAt: string
}

function isVideo(asset: Asset) {
  return asset.format && ['mp4', 'webm', 'mov', 'avi'].includes(asset.format)
}

export default function LibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Asset | null>(null)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all')
  const [noCloudinary, setNoCloudinary] = useState(false)

  const load = async () => {
    const res = await fetch('/api/library')
    const data = await res.json()
    setAssets(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const upload = useCallback(async (files: File[]) => {
    setUploading(true)
    setNoCloudinary(false)
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/library', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        if (err.error?.includes('Cloudinary')) { setNoCloudinary(true); break }
      } else {
        const asset = await res.json()
        setAssets((prev) => [asset, ...prev])
      }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: upload,
    accept: { 'image/*': [], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] },
    maxSize: 50 * 1024 * 1024,
  })

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.filename}"?`)) return
    setDeleting(asset.id)
    await fetch(`/api/library/${asset.id}`, { method: 'DELETE' })
    setAssets((prev) => prev.filter((a) => a.id !== asset.id))
    if (selected?.id === asset.id) setSelected(null)
    setDeleting(null)
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = assets.filter((a) => {
    if (filter === 'images') return !isVideo(a)
    if (filter === 'videos') return isVideo(a)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Content Library</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['all', 'images', 'videos'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 capitalize font-medium transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{f}</button>
            ))}
          </div>
          <span className="text-sm text-gray-400">{filtered.length} asset{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Cloudinary warning */}
        {noCloudinary && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800 text-sm">Cloudinary not configured</p>
              <p className="text-amber-700 text-sm mt-0.5">Add <code className="bg-amber-100 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-amber-100 px-1 rounded">CLOUDINARY_API_KEY</code>, and <code className="bg-amber-100 px-1 rounded">CLOUDINARY_API_SECRET</code> to your environment variables. Get them free at cloudinary.com.</p>
            </div>
          </div>
        )}

        {/* Upload zone */}
        <div
          {...getRootProps()}
          className={`mb-8 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Uploading to Cloudinary…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{isDragActive ? 'Drop files here' : 'Upload to your library'}</p>
                <p className="text-sm text-gray-400 mt-1">Images (JPEG, PNG, WebP, GIF) or videos (MP4, WebM) up to 50MB</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No assets yet</p>
            <p className="text-sm mt-1">Upload images or videos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selected?.id === asset.id ? 'border-violet-500 shadow-lg shadow-violet-100' : 'border-transparent hover:border-gray-200'}`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {isVideo(asset) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(asset) }}
                    disabled={deleting === asset.id}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 font-medium truncate">{asset.filename}</p>
                  <p className="text-xs text-gray-400">{formatBytes(asset.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail panel */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {isVideo(selected) ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              ) : (
                <img src={selected.url} alt={selected.filename} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{selected.filename}</p>
              <p className="text-sm text-gray-400">
                {formatBytes(selected.size)}
                {selected.width && selected.height && ` · ${selected.width}×${selected.height}`}
                {selected.format && ` · ${selected.format.toUpperCase()}`}
                {` · ${formatDate(selected.createdAt)}`}
              </p>
              <p className="text-xs text-gray-400 truncate mt-1 font-mono">{selected.url}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => copyUrl(selected.url)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {copied ? (
                  <><svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy URL</>
                )}
              </button>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Open
              </a>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
