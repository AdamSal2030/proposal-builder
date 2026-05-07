'use client'
import type { ScopeData } from '@/lib/types'

interface Props { data: ScopeData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function ScopeSection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern
  const included = data.items.filter((i) => i.included)
  const excluded = data.items.filter((i) => !i.included)

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{data.title}</h2>
          <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full mb-5`} />
          {data.intro && (
            isHtml(data.intro) ? (
              <div className="text-gray-500 text-lg leading-relaxed prose prose-gray" dangerouslySetInnerHTML={{ __html: data.intro }} />
            ) : (
              <p className="text-gray-500 text-lg leading-relaxed">{data.intro}</p>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {included.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">What's Included</h3>
              </div>
              <ul className="space-y-3">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {excluded.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Not Included</h3>
              </div>
              <ul className="space-y-3">
                {excluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-gray-400 text-sm leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
