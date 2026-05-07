'use client'
import type { TextBlockData } from '@/lib/types'

interface Props {
  data: TextBlockData
  variant?: 'light' | 'gray'
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function TextBlockSection({ data, variant = 'light' }: Props) {
  return (
    <section className={`px-6 py-24 ${variant === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">{data.title}</h2>
        {isHtml(data.content) ? (
          <div
            className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">{data.content}</p>
        )}
      </div>
    </section>
  )
}
