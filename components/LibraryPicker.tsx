'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatBytes } from '@/lib/utils'

interface Asset {
  id: string
  filename: string
  url: string
  format: string | null
  size: number
  width: number | null
  height: number | null
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

function isVideo(asset: Asset) {
  return asset.format && ['mp4', 'webm', 'mov'].includes(asset.format)
}

export default function LibraryPicker({ onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'library' | 'upload'>('library')

  useEffect(() => {
    fetch('/api/library')
      .then((r) => r.json())
      .then((d) => { setAssets(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const upload = useCallback(async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/library', { method: 'POST', body: formData })
      if (res.ok) {
        const asset = await res.json()
        setAssets((prev) => [asset, ...prev])
        onSelect(asset.url)
        onClose()
        return
      }
    }
    setUploading(false)
  }, [onSelect, onClose])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: upload,
    accept: { 'image/*': [], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] },
    maxSize: 50 * 1024 * 1024,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Content Library</h2>
            <p className="text-sm text-gray-400">Pick from your library or upload a new file</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button onClick={() => setTab('library')} className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${tab === 'library' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Library ({assets.length})
          </button>
          <button onClick={() => setTab('upload')} className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'upload' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Upload New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'library' ? (
            loading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="font-medium">No assets yet</p>
                <p className="text-sm mt-1">Switch to Upload tab to add your first file</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => { onSelect(asset.url); onClose() }}
                    className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all text-left"
                  >
                    <div className="aspect-square bg-gray-100">
                      {isVideo(asset) ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      ) : (
                        <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-xs text-gray-600 truncate">{asset.filename}</p>
                      <p className="text-xs text-gray-400">{formatBytes(asset.size)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center ${isDragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <>
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-medium text-gray-700">Uploading to Cloudinary…</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700">{isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}</p>
                  <p className="text-sm text-gray-400 mt-1">Images or videos, up to 50MB · Stored in Cloudinary</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
