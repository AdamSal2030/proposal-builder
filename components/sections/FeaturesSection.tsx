'use client'
import type { FeaturesData } from '@/lib/types'

interface Props {
  data: FeaturesData
  theme: string
}

const accentClasses: Record<string, string> = {
  modern: 'bg-blue-100 text-blue-700',
  bold: 'bg-gray-800 text-white',
  classic: 'bg-teal-100 text-teal-700',
}

export default function FeaturesSection({ data, theme }: Props) {
  const accent = accentClasses[theme] ?? accentClasses.modern
  return (
    <section className="px-6 py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">{data.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-4 ${accent}`}>
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
