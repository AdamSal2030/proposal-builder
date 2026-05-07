'use client'
import type { InvestmentData } from '@/lib/types'

interface Props { data: InvestmentData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}
const highlightBg: Record<string, string> = {
  modern: 'from-blue-600 to-indigo-600',
  bold: 'from-gray-800 to-gray-900',
  classic: 'from-teal-600 to-emerald-700',
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function InvestmentSection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern
  const highlight = highlightBg[theme] ?? highlightBg.modern

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{data.title}</h2>
          <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full mb-4`} />
          {data.intro && (
            isHtml(data.intro) ? (
              <div className="text-gray-500 text-lg leading-relaxed prose prose-gray" dangerouslySetInnerHTML={{ __html: data.intro }} />
            ) : (
              <p className="text-gray-500 text-lg leading-relaxed">{data.intro}</p>
            )
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-2 px-8 py-4 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Amount</span>
          </div>

          {/* Line items */}
          {data.items.map((item, i) => (
            <div key={i} className="grid grid-cols-2 px-8 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <span className="text-gray-700 text-sm">{item.description}</span>
              <span className="text-gray-900 font-semibold text-sm text-right">{item.amount}</span>
            </div>
          ))}

          {/* Total row */}
          <div className={`grid grid-cols-2 px-8 py-6 bg-gradient-to-r ${highlight}`}>
            <span className="text-white font-bold text-lg">Total Investment</span>
            <span className="text-white font-bold text-2xl text-right">{data.total}</span>
          </div>
        </div>

        {/* Notes & validity */}
        {(data.notes || data.validity) && (
          <div className="mt-6 flex flex-col gap-2">
            {data.validity && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This quote is valid for {data.validity}
              </div>
            )}
            {data.notes && <p className="text-sm text-gray-400 leading-relaxed">{data.notes}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
