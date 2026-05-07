'use client'
import { useState, useEffect, useCallback } from 'react'

interface LibraryAsset {
  id: string
  filename: string
  url: string
  publicId: string
  width?: number | null
  height?: number | null
  format?: string | null
}

interface TransformState {
  width: string
  height: string
  crop: string
  gravity: string
  filter: string
  brightness: number
  contrast: number
  saturation: number
  blur: number
  sharpen: number
  roundCorners: number
  removeBackground: boolean
  autoFormat: boolean
  autoQuality: boolean
  flip: boolean
  flop: boolean
  grayscale: boolean
}

const DEFAULT: TransformState = {
  width: '',
  height: '',
  crop: 'scale',
  gravity: 'auto',
  filter: 'none',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sharpen: 0,
  roundCorners: 0,
  removeBackground: false,
  autoFormat: true,
  autoQuality: true,
  flip: false,
  flop: false,
  grayscale: false,
}

const CROP_MODES = [
  { value: 'scale', label: 'Scale' },
  { value: 'fill', label: 'Fill' },
  { value: 'fit', label: 'Fit' },
  { value: 'thumb', label: 'Thumb' },
  { value: 'pad', label: 'Pad' },
  { value: 'crop', label: 'Crop' },
]

const GRAVITY_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'face', label: 'Face' },
  { value: 'center', label: 'Center' },
  { value: 'north', label: 'Top' },
  { value: 'south', label: 'Bottom' },
  { value: 'east', label: 'Right' },
  { value: 'west', label: 'Left' },
]

const FILTER_PRESETS = [
  { value: 'none', label: 'None', color: 'bg-gray-100' },
  { value: 'sepia', label: 'Sepia', color: 'bg-amber-100' },
  { value: 'oil_paint', label: 'Oil Paint', color: 'bg-orange-100' },
  { value: 'cartoonify', label: 'Cartoon', color: 'bg-blue-100' },
  { value: 'vignette', label: 'Vignette', color: 'bg-gray-900' },
  { value: 'art:audrey', label: 'Audrey', color: 'bg-pink-100' },
  { value: 'art:eucalyptus', label: 'Eucalyptus', color: 'bg-green-100' },
  { value: 'art:hokusai', label: 'Hokusai', color: 'bg-cyan-100' },
  { value: 'art:incognito', label: 'Incognito', color: 'bg-gray-800' },
  { value: 'art:linen', label: 'Linen', color: 'bg-yellow-50' },
  { value: 'art:peacock', label: 'Peacock', color: 'bg-teal-100' },
  { value: 'art:primavera', label: 'Primavera', color: 'bg-rose-100' },
]

function buildTransformUrl(publicId: string, t: TransformState, cloudName = 'dyacgfsdx'): string {
  const parts: string[] = []

  if (t.autoQuality) parts.push('q_auto')
  if (t.autoFormat) parts.push('f_auto')

  const hasDimension = t.width || t.height
  if (hasDimension) {
    const dims: string[] = []
    if (t.width) dims.push(`w_${t.width}`)
    if (t.height) dims.push(`h_${t.height}`)
    dims.push(`c_${t.crop}`)
    if (['fill', 'thumb', 'crop'].includes(t.crop)) dims.push(`g_${t.gravity}`)
    parts.push(dims.join(','))
  }

  if (t.removeBackground) parts.push('e_background_removal')

  if (t.grayscale) parts.push('e_grayscale')

  if (t.filter !== 'none') {
    if (t.filter.startsWith('art:')) {
      parts.push(`e_${t.filter}`)
    } else if (t.filter === 'sepia') {
      parts.push('e_sepia:80')
    } else if (t.filter === 'oil_paint') {
      parts.push('e_oil_paint:40')
    } else if (t.filter === 'cartoonify') {
      parts.push('e_cartoonify')
    } else if (t.filter === 'vignette') {
      parts.push('e_vignette:40')
    }
  }

  if (t.brightness !== 0) parts.push(`e_brightness:${t.brightness}`)
  if (t.contrast !== 0) parts.push(`e_contrast:${t.contrast}`)
  if (t.saturation !== 0) parts.push(`e_saturation:${t.saturation}`)
  if (t.blur > 0) parts.push(`e_blur:${t.blur}`)
  if (t.sharpen > 0) parts.push(`e_sharpen:${t.sharpen}`)
  if (t.roundCorners > 0) parts.push(t.roundCorners >= 100 ? 'r_max' : `r_${t.roundCorners * 2}`)
  if (t.flip) parts.push('a_vflip')
  if (t.flop) parts.push('a_hflip')

  const transform = parts.join('/')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`
}

interface Props {
  asset: LibraryAsset
  onClose: () => void
}

function Slider({ label, value, min, max, step = 1, onChange, showValue = true }: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  showValue?: boolean
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        {showValue && <span className="text-xs text-gray-400 font-mono">{value}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  )
}

export default function ImageTransformer({ asset, onClose }: Props) {
  const [t, setT] = useState<TransformState>(DEFAULT)
  const [previewUrl, setPreviewUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  const update = useCallback((patch: Partial<TransformState>) => {
    setT((prev) => ({ ...prev, ...patch }))
  }, [])

  useEffect(() => {
    const url = buildTransformUrl(asset.publicId, t)
    setPreviewUrl(url)
  }, [t, asset.publicId])

  const handleCopy = () => {
    navigator.clipboard.writeText(previewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    const res = await fetch(previewUrl)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${asset.filename.replace(/\.[^.]+$/, '')}-edited.${t.autoFormat ? 'webp' : (asset.format || 'jpg')}`
    a.click()
  }

  const handleReset = () => setT(DEFAULT)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Image Studio</h2>
            <p className="text-xs text-gray-400 truncate max-w-xs">{asset.filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Controls panel */}
          <div className="w-80 flex-shrink-0 border-r border-gray-100 overflow-y-auto p-5 space-y-6">

            {/* Resize */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resize</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={t.width}
                    onChange={(e) => update({ width: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={t.height}
                    onChange={(e) => update({ height: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-500 mb-1.5 block">Crop Mode</label>
                <div className="flex flex-wrap gap-1.5">
                  {CROP_MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => update({ crop: m.value })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        t.crop === m.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {['fill', 'thumb', 'crop'].includes(t.crop) && (
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Focus / Gravity</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GRAVITY_OPTIONS.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => update({ gravity: g.value })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          t.gravity === g.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Flip */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Transform</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => update({ flip: !t.flip })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    t.flip ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Flip V
                </button>
                <button
                  onClick={() => update({ flop: !t.flop })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    t.flop ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Mirror H
                </button>
              </div>
            </section>

            {/* Filters */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filters & Art</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => update({ filter: f.value, grayscale: false })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                      t.filter === f.value
                        ? 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50 text-blue-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => update({ grayscale: !t.grayscale, filter: 'none' })}
                className={`mt-2 w-full py-2 rounded-xl text-xs font-medium border transition-colors ${
                  t.grayscale ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grayscale
              </button>
            </section>

            {/* Adjustments */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Adjustments</h3>
              <div className="space-y-4">
                <Slider label="Brightness" value={t.brightness} min={-100} max={100} onChange={(v) => update({ brightness: v })} />
                <Slider label="Contrast" value={t.contrast} min={-100} max={100} onChange={(v) => update({ contrast: v })} />
                <Slider label="Saturation" value={t.saturation} min={-100} max={100} onChange={(v) => update({ saturation: v })} />
              </div>
            </section>

            {/* Effects */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Effects</h3>
              <div className="space-y-4">
                <Slider label="Blur" value={t.blur} min={0} max={2000} step={50} onChange={(v) => update({ blur: v })} />
                <Slider label="Sharpen" value={t.sharpen} min={0} max={400} step={10} onChange={(v) => update({ sharpen: v })} />
                <Slider label="Round Corners %" value={t.roundCorners} min={0} max={100} onChange={(v) => update({ roundCorners: v })} />
              </div>
            </section>

            {/* Advanced */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Advanced</h3>
              <div className="space-y-2">
                {[
                  { key: 'autoFormat' as const, label: 'Auto Format (WebP/AVIF)', desc: 'Serve best format per browser' },
                  { key: 'autoQuality' as const, label: 'Smart Quality', desc: 'AI-optimized compression' },
                  { key: 'removeBackground' as const, label: 'Remove Background', desc: 'AI background removal' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => update({ [key]: !t[key] })}
                      className={`mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors relative cursor-pointer ${
                        t[key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t[key] ? 'translate-x-4' : ''}`} />
                    </div>
                    <div onClick={() => update({ [key]: !t[key] })}>
                      <p className="text-xs font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Preview panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Image preview */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
              <div className="relative max-w-full max-h-full">
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {/* Checkerboard background for transparency */}
                <div
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)', backgroundSize: '20px 20px' }}
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[55vh] object-contain rounded-xl"
                    onLoadStart={() => setPreviewLoading(true)}
                    onLoad={() => setPreviewLoading(false)}
                    onError={() => setPreviewLoading(false)}
                  />
                </div>
              </div>
            </div>

            {/* URL bar + actions */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3 border border-gray-200">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs text-gray-500 flex-1 truncate font-mono">{previewUrl}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
