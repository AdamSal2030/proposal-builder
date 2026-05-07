'use client'
import type { TextBlockData } from '@/lib/types'

interface Props {
  data: TextBlockData
  variant?: 'light' | 'gray'
}

export default function TextBlockSection({ data, variant = 'light' }: Props) {
  return (
    <section className={`px-6 py-20 ${variant === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">{data.content}</p>
      </div>
    </section>
  )
}
