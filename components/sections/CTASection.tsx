'use client'
import type { CTAData } from '@/lib/types'

interface Props {
  data: CTAData
  theme: string
  isEditing?: boolean
  onUpdate?: (data: CTAData) => void
}

const gradients: Record<string, string> = {
  modern: 'from-blue-600 via-indigo-600 to-violet-700',
  bold: 'from-gray-900 via-zinc-800 to-gray-900',
  classic: 'from-teal-600 via-emerald-600 to-green-700',
}

export default function CTASection({ data, theme, isEditing, onUpdate }: Props) {
  const gradient = gradients[theme] ?? gradients.modern
  const upd = (patch: Partial<CTAData>) => onUpdate?.({ ...data, ...patch })

  return (
    <section id="contact" className={`relative bg-gradient-to-br ${gradient} text-white px-6 py-32 text-center overflow-hidden`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/10" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold mb-6 leading-tight">
          {isEditing ? (
            <input
              type="text"
              value={data.title}
              onChange={(e) => upd({ title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-white text-center w-full focus:outline-none border-b-2 border-white/20 focus:border-white/60 font-bold"
              style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
              placeholder="CTA heading…"
            />
          ) : data.title}
        </h2>

        <p className="text-white/70 text-xl mb-12 leading-relaxed">
          {isEditing ? (
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => upd({ subtitle: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-white/70 text-center w-full focus:outline-none border-b border-white/20 focus:border-white/40"
              style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
              placeholder="Subtitle…"
            />
          ) : data.subtitle}
        </p>

        <div className="inline-flex items-center gap-3 bg-white text-gray-900 font-bold px-10 py-5 rounded-full text-lg shadow-2xl shadow-black/20">
          {isEditing ? (
            <input
              type="text"
              value={data.buttonText}
              onChange={(e) => upd({ buttonText: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-gray-900 text-center focus:outline-none font-bold"
              style={{ fontSize: 'inherit' }}
              placeholder="Button text"
            />
          ) : (
            <>
              {data.buttonText}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
