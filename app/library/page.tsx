'use client'
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { formatBytes, formatDate } from '@/lib/utils'

const ImageTransformer = lazy(() => import('@/components/ImageTransformer'))

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
  const [studioAsset, setStudioAsset] = useState<Asset | null>(null)
  const [search, setSearch] = useState('')

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
    const matchFilter = filter === 'images' ? !isVideo(a) : filter === 'videos' ? isVideo(a) : true
    const matchSearch = a.filename.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">Library</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10 w-40 transition-all placeholder-gray-300"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(['all', 'images', 'videos'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-300 hidden sm:block">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Cloudinary warning */}
        {noCloudinary && (
          <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-900 text-sm">Cloudinary not configured</p>
              <p className="text-amber-700 text-sm mt-0.5">Add <code className="bg-amber-100 px-1 rounded text-xs">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-amber-100 px-1 rounded text-xs">CLOUDINARY_API_KEY</code>, and <code className="bg-amber-100 px-1 rounded text-xs">CLOUDINARY_API_SECRET</code> to your environment variables.</p>
            </div>
          </div>
        )}

        {/* Upload zone */}
        <div
          {...getRootProps()}
          className={`mb-6 border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">
                {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
                <span className="text-gray-300 ml-2">Images & videos up to 50MB</span>
              </p>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm font-medium">{search || filter !== 'all' ? 'No files match' : 'No files yet'}</p>
            <p className="text-xs mt-1 text-gray-300">
              {search || filter !== 'all' ? 'Try a different search or filter' : 'Upload images or videos to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  selected?.id === asset.id
                    ? 'ring-2 ring-black shadow-lg'
                    : 'hover:ring-1 hover:ring-gray-300 hover:shadow-md'
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {isVideo(asset) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                  {/* Actions */}
                  {!isVideo(asset) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setStudioAsset(asset) }}
                      className="absolute bottom-2 left-2 bg-white text-gray-900 rounded-lg px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 flex items-center gap-1"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(asset) }}
                    disabled={deleting === asset.id}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Caption */}
                <div className="px-1.5 py-1.5 bg-white border-t border-gray-50">
                  <p className="text-xs text-gray-700 font-medium truncate">{asset.filename}</p>
                  <p className="text-xs text-gray-300">{formatBytes(asset.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Studio modal */}
      {studioAsset && (
        <Suspense fallback={null}>
          <ImageTransformer asset={studioAsset} onClose={() => setStudioAsset(null)} />
        </Suspense>
      )}

      {/* Selected asset detail panel */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl shadow-black/5 px-6 py-3 z-20">
          <div className="max-w-5xl mx-auto flex items-center gap-5">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
              {isVideo(selected) ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              ) : (
                <img src={selected.url} alt={selected.filename} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{selected.filename}</p>
              <p className="text-xs text-gray-400">
                {formatBytes(selected.size)}
                {selected.width && selected.height && ` · ${selected.width}×${selected.height}`}
                {selected.format && ` · ${selected.format.toUpperCase()}`}
                {` · ${formatDate(selected.createdAt)}`}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isVideo(selected) && (
                <button
                  onClick={() => setStudioAsset(selected)}
                  className="text-sm font-medium text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Image Studio
                </button>
              )}
              <button
                onClick={() => copyUrl(selected.url)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Open
              </a>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
