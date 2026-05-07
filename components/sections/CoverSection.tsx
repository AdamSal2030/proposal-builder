'use client'
import type { CoverData } from '@/lib/types'

interface Props {
  data: CoverData
  theme: string
  isEditing?: boolean
  onUpdate?: (data: CoverData) => void
}

const gradients: Record<string, string> = {
  modern: 'from-slate-900 via-blue-950 to-slate-900',
  bold: 'from-gray-900 via-gray-800 to-gray-900',
  classic: 'from-emerald-950 via-teal-900 to-emerald-950',
}
const accents: Record<string, string> = {
  modern: 'from-blue-400 to-indigo-400',
  bold: 'from-orange-400 to-amber-400',
  classic: 'from-teal-400 to-emerald-400',
}

function Editable({ isEditing, value, onChange, className, placeholder, multiline }: {
  isEditing?: boolean
  value: string
  onChange: (v: string) => void
  className: string
  placeholder?: string
  multiline?: boolean
}) {
  if (!isEditing) return <span className={className}>{value}</span>
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className={`${className} bg-transparent focus:outline-none border-b border-current/20 focus:border-current/50 resize-none w-full`}
        placeholder={placeholder}
        rows={2}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`${className} bg-transparent focus:outline-none border-b border-current/20 focus:border-current/50 w-full`}
      placeholder={placeholder}
      style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
    />
  )
}

export default function CoverSection({ data, theme, isEditing, onUpdate }: Props) {
  const grad = gradients[theme] ?? gradients.modern
  const accent = accents[theme] ?? accents.modern
  const upd = (patch: Partial<CoverData>) => onUpdate?.({ ...data, ...patch })

  return (
    <section
      className="relative min-h-screen flex flex-col"
      style={data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${data.backgroundImage ? 'from-black/70 to-black/50' : grad}`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-16 py-10">
          {data.logo ? (
            <img src={data.logo} alt="Logo" className="h-12 object-contain" />
          ) : (
            <div className={`text-transparent bg-clip-text bg-gradient-to-r ${accent} font-bold text-2xl tracking-tight`}>
              <Editable
                isEditing={isEditing}
                value={data.preparedBy}
                onChange={(v) => upd({ preparedBy: v })}
                className="font-bold text-2xl tracking-tight"
                placeholder="Your Company"
              />
            </div>
          )}
          <div className="text-white/40 text-sm">
            <Editable
              isEditing={isEditing}
              value={data.date}
              onChange={(v) => upd({ date: v })}
              className="text-white/40 text-sm text-right"
              placeholder="May 2026"
            />
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
          <div className={`w-24 h-0.5 bg-gradient-to-r ${accent} mb-10 rounded-full`} />
          <h1 className="text-6xl font-bold text-white leading-tight tracking-tight mb-6 max-w-4xl w-full">
            {isEditing ? (
              <input
                type="text"
                value={data.title}
                onChange={(e) => upd({ title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent text-white text-center w-full focus:outline-none border-b-2 border-white/20 focus:border-white/60 font-bold tracking-tight"
                style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                placeholder="Proposal Title"
              />
            ) : data.title}
          </h1>
          {(data.subtitle || isEditing) && (
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={data.subtitle ?? ''}
                  onChange={(e) => upd({ subtitle: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-white/60 text-center w-full focus:outline-none border-b border-white/20 focus:border-white/40"
                  style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                  placeholder="A tailored proposal prepared exclusively for you"
                />
              ) : data.subtitle}
            </p>
          )}
          <div className={`w-24 h-0.5 bg-gradient-to-r ${accent} mt-10 rounded-full`} />
        </div>

        {/* Bottom meta */}
        <div className="px-16 py-10 grid grid-cols-3 gap-8 border-t border-white/10">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Prepared For</p>
            <Editable
              isEditing={isEditing}
              value={data.preparedFor}
              onChange={(v) => upd({ preparedFor: v })}
              className="text-white font-semibold text-lg"
              placeholder="Client Name"
            />
          </div>
          <div className="text-center">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Prepared By</p>
            <Editable
              isEditing={isEditing}
              value={data.preparedBy}
              onChange={(v) => upd({ preparedBy: v })}
              className="text-white font-semibold text-lg text-center"
              placeholder="Your Company"
            />
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Date</p>
            <Editable
              isEditing={isEditing}
              value={data.date}
              onChange={(v) => upd({ date: v })}
              className="text-white font-semibold text-lg text-right"
              placeholder="May 2026"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
