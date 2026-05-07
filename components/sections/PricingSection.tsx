'use client'
import type { PricingData } from '@/lib/types'

interface Props {
  data: PricingData
  theme: string
}

const highlightGradients: Record<string, string> = {
  modern: 'from-blue-600 to-indigo-600',
  bold: 'from-gray-800 to-gray-900',
  classic: 'from-teal-600 to-emerald-600',
}

export default function PricingSection({ data, theme }: Props) {
  const hl = highlightGradients[theme] ?? highlightGradients.modern

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-gray-500">Choose the plan that fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {data.tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                tier.highlighted
                  ? `bg-gradient-to-br ${hl} text-white shadow-2xl scale-105`
                  : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-4 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className={`text-sm mb-2 ${tier.highlighted ? 'text-white/70' : 'text-gray-500'}`}>{tier.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.highlighted ? 'bg-white/20' : 'bg-green-100'}`}>
                      <svg className={`w-3 h-3 ${tier.highlighted ? 'text-white' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={tier.highlighted ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
