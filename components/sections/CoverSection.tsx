'use client'
import type { CoverData } from '@/lib/types'

interface Props { data: CoverData; theme: string }

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

export default function CoverSection({ data, theme }: Props) {
  const grad = gradients[theme] ?? gradients.modern
  const accent = accents[theme] ?? accents.modern

  return (
    <section
      className="relative min-h-screen flex flex-col"
      style={data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${data.backgroundImage ? 'from-black/70 to-black/50' : grad}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-16 py-10">
          {data.logo ? (
            <img src={data.logo} alt="Logo" className="h-12 object-contain" />
          ) : (
            <div className={`text-transparent bg-clip-text bg-gradient-to-r ${accent} font-bold text-2xl tracking-tight`}>
              {data.preparedBy}
            </div>
          )}
          <div className="text-white/40 text-sm">{data.date}</div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
          <div className={`w-24 h-0.5 bg-gradient-to-r ${accent} mb-10 rounded-full`} />
          <h1 className="text-6xl font-bold text-white leading-tight tracking-tight mb-6 max-w-4xl">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="text-xl text-white/60 max-w-2xl leading-relaxed">{data.subtitle}</p>
          )}
          <div className={`w-24 h-0.5 bg-gradient-to-r ${accent} mt-10 rounded-full`} />
        </div>

        {/* Bottom meta */}
        <div className="px-16 py-10 grid grid-cols-3 gap-8 border-t border-white/10">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Prepared For</p>
            <p className="text-white font-semibold text-lg">{data.preparedFor}</p>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Prepared By</p>
            <p className="text-white font-semibold text-lg">{data.preparedBy}</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Date</p>
            <p className="text-white font-semibold text-lg">{data.date}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
