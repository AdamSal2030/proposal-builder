'use client'
import type { TimelineData } from '@/lib/types'

interface Props {
  data: TimelineData
  theme: string
}

const dotGradients: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-gray-700 to-gray-900',
  classic: 'from-teal-500 to-emerald-600',
}

const lineColors: Record<string, string> = {
  modern: 'bg-gradient-to-b from-blue-200 to-indigo-200',
  bold: 'bg-gradient-to-b from-gray-300 to-gray-400',
  classic: 'bg-gradient-to-b from-teal-200 to-emerald-200',
}

export default function TimelineSection({ data, theme }: Props) {
  const dot = dotGradients[theme] ?? dotGradients.modern
  const line = lineColors[theme] ?? lineColors.modern

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-8 top-4 bottom-4 w-0.5 ${line}`} />

          <div className="space-y-12">
            {data.items.map((item, i) => (
              <div key={i} className="relative flex gap-8">
                {/* Dot */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${dot} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-white font-bold text-lg">{i + 1}</span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{item.phase}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
