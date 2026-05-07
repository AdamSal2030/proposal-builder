'use client'
import type { CTAData } from '@/lib/types'

interface Props {
  data: CTAData
  theme: string
}

const themeClasses: Record<string, string> = {
  modern: 'bg-blue-600',
  bold: 'bg-gray-900',
  classic: 'bg-teal-600',
}

export default function CTASection({ data, theme }: Props) {
  return (
    <section id="contact" className={`${themeClasses[theme] ?? themeClasses.modern} text-white px-6 py-24 text-center`}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
        <p className="text-white/80 text-lg mb-10">{data.subtitle}</p>
        <a
          href="mailto:"
          className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          {data.buttonText}
        </a>
      </div>
    </section>
  )
}
