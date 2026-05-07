'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  value?: string
  onChange: (url: string) => void
  accept?: 'image' | 'image+video'
  label?: string
  className?: string
}

export default function ImageUploader({ value, onChange, accept = 'image', label = 'Upload Image', className = '' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = useCallback(async (file: File) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/images', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onChange(data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) upload(files[0])
  }, [upload])

  const acceptMap: Record<string, string[]> = accept === 'image+video'
    ? { 'image/*': [], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] }
    : { 'image/*': [] }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    maxFiles: 1,
    maxSize: accept === 'image+video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024,
  })

  return (
    <div className={className}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          {value.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={value} className="w-full h-40 object-cover" muted />
          ) : (
            <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                {uploading ? 'Uploading…' : 'Replace'}
              </button>
            </div>
            <button type="button" onClick={() => onChange('')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">{isDragActive ? 'Drop here' : label}</p>
              <p className="text-xs text-gray-400">
                {accept === 'image+video' ? 'Image or MP4/WebM video, up to 100MB' : 'JPEG, PNG, WebP, SVG up to 10MB'}
              </p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
