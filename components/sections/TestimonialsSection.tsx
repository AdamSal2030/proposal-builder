'use client'
import type { TestimonialsData } from '@/lib/types'

interface Props { data: TestimonialsData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}
const quoteColors: Record<string, string> = {
  modern: 'text-blue-100',
  bold: 'text-orange-100',
  classic: 'text-teal-100',
}

export default function TestimonialsSection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern
  const quoteColor = quoteColors[theme] ?? quoteColors.modern

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full mx-auto`} />
        </div>

        <div className={`grid gap-8 ${data.items.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : data.items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {data.items.map((item, i) => (
            <div key={i} className="relative bg-gray-50 rounded-3xl p-8 flex flex-col">
              {/* Big quote mark */}
              <div className={`absolute top-6 right-8 text-8xl font-serif leading-none ${quoteColor} select-none`}>"</div>

              <p className="text-gray-700 text-lg leading-relaxed italic relative z-10 flex-1 mb-8">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.author} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {item.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{item.author}</p>
                  <p className="text-sm text-gray-400">{[item.role, item.company].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
