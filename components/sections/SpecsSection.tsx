'use client'
import type { SpecsData } from '@/lib/types'

interface Props { data: SpecsData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}

export default function SpecsSection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern
  const hasImage = !!data.image

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{data.title}</h2>
          <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full mb-4`} />
          {data.subtitle && <p className="text-gray-500 text-lg">{data.subtitle}</p>}
        </div>

        <div className={`grid gap-12 items-start ${hasImage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>
          {/* Specs table */}
          <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {data.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-6 px-8 py-5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${i < data.items.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="text-sm font-semibold text-gray-500 w-40 flex-shrink-0 pt-0.5">{item.label}</span>
                <span className="text-sm text-gray-900 font-medium flex-1">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Optional image */}
          {hasImage && (
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
