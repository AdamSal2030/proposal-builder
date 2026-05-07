'use client'
import type { TermsData } from '@/lib/types'

interface Props { data: TermsData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function TermsSection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{data.title}</h2>
          <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full`} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
          {isHtml(data.content) ? (
            <div
              className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          ) : (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{data.content}</p>
          )}

          {data.showSignature && (
            <div className="mt-12 pt-8 border-t border-dashed border-gray-200">
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <div className="h-px bg-gray-300 mb-3" />
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Client Signature</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-px bg-gray-200" />
                    <p className="text-xs text-gray-400">Name</p>
                    <div className="h-px bg-gray-200 mt-4" />
                    <p className="text-xs text-gray-400">Date</p>
                  </div>
                </div>
                <div>
                  <div className="h-px bg-gray-300 mb-3" />
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Authorized Signature</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-px bg-gray-200" />
                    <p className="text-xs text-gray-400">Name</p>
                    <div className="h-px bg-gray-200 mt-4" />
                    <p className="text-xs text-gray-400">Date</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
