'use client'
import type { PricingData } from '@/lib/types'

interface Props {
  data: PricingData
  theme: string
}

const highlightClasses: Record<string, string> = {
  modern: 'bg-blue-600 text-white border-blue-600',
  bold: 'bg-gray-900 text-white border-gray-900',
  classic: 'bg-teal-600 text-white border-teal-600',
}

export default function PricingSection({ data, theme }: Props) {
  const highlight = highlightClasses[theme] ?? highlightClasses.modern
  return (
    <section className="px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">{data.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {data.tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 p-8 flex flex-col ${tier.highlighted ? highlight : 'border-gray-200 bg-white'}`}
            >
              <h3 className={`text-xl font-bold mb-2 ${tier.highlighted ? 'text-current' : 'text-gray-900'}`}>{tier.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className={`text-sm ml-1 ${tier.highlighted ? 'text-white/70' : 'text-gray-500'}`}>{tier.period}</span>}
              </div>
              <ul className="space-y-3 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-white/80' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={tier.highlighted ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
