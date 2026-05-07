'use client'
import type { FeaturesData } from '@/lib/types'

interface Props {
  data: FeaturesData
  theme: string
}

const accentGradients: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-gray-700 to-gray-900',
  classic: 'from-teal-500 to-emerald-600',
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function FeaturesSection({ data, theme }: Props) {
  const accent = accentGradients[theme] ?? accentGradients.modern

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <div className={`w-16 h-1 bg-gradient-to-r ${accent} rounded-full mx-auto`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />

              {/* Image or gradient number icon */}
              {item.image ? (
                <div className="h-48 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="p-6 pb-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100 mb-4`}>
                    {i + 1}
                  </div>
                </div>
              )}

              <div className={`p-6 ${item.image ? '' : 'pt-4'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                {isHtml(item.description) ? (
                  <div
                    className="text-gray-500 text-sm leading-relaxed prose prose-sm prose-gray"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
