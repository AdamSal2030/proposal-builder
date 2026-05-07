'use client'
import type { TimelineData } from '@/lib/types'

interface Props {
  data: TimelineData
  theme: string
}

const dotClasses: Record<string, string> = {
  modern: 'bg-blue-600',
  bold: 'bg-gray-800',
  classic: 'bg-teal-600',
}

export default function TimelineSection({ data, theme }: Props) {
  const dot = dotClasses[theme] ?? dotClasses.modern
  return (
    <section className="px-6 py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">{data.title}</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-10">
            {data.items.map((item, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className={`w-8 h-8 rounded-full ${dot} flex items-center justify-center flex-shrink-0 z-10 mt-0.5`}>
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{item.phase}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.duration}</span>
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
