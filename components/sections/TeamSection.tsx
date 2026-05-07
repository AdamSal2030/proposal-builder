'use client'
import type { TeamData } from '@/lib/types'

interface Props {
  data: TeamData
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function TeamSection({ data }: Props) {
  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.members.map((m, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Header with avatar */}
              <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-end justify-center pb-0">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
                      {initials(m.name)}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-14 pb-6 px-6 text-center">
                <h3 className="font-bold text-gray-900 text-xl mb-1">{m.name}</h3>
                <p className="text-blue-600 font-medium text-sm mb-4">{m.role}</p>
                {isHtml(m.bio) ? (
                  <div
                    className="text-gray-500 text-sm leading-relaxed prose prose-sm prose-gray text-left"
                    dangerouslySetInnerHTML={{ __html: m.bio }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm leading-relaxed">{m.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
