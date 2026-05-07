'use client'
import type { TeamData } from '@/lib/types'

interface Props {
  data: TeamData
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function TeamSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">{data.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.members.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {initials(m.name)}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{m.name}</h3>
              <p className="text-blue-600 text-sm mb-3">{m.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
