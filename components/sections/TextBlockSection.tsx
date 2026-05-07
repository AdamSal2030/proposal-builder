'use client'
import type { TextBlockData } from '@/lib/types'

interface Props {
  data: TextBlockData
  variant?: 'light' | 'gray'
  isEditing?: boolean
  onUpdate?: (data: TextBlockData) => void
}

const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

export default function TextBlockSection({ data, variant = 'light', isEditing, onUpdate }: Props) {
  return (
    <section className={`px-6 py-24 ${variant === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {isEditing ? (
            <input
              type="text"
              value={data.title}
              onChange={(e) => onUpdate?.({ ...data, title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-gray-900 w-full focus:outline-none border-b-2 border-gray-200 focus:border-gray-500 font-bold"
              style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
              placeholder="Section title…"
            />
          ) : data.title}
        </h2>

        {isEditing ? (
          <textarea
            value={isHtml(data.content) ? data.content.replace(/<[^>]+>/g, '') : data.content}
            onChange={(e) => onUpdate?.({ ...data, content: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-lg text-gray-600 leading-relaxed focus:outline-none bg-transparent border border-gray-200 focus:border-gray-400 rounded-lg p-4 resize-none min-h-[120px]"
            placeholder="Write your content here… (use the right panel for rich text formatting)"
            rows={5}
          />
        ) : isHtml(data.content) ? (
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
