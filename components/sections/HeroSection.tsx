'use client'
import type { HeroData } from '@/lib/types'

interface Props {
  data: HeroData
  theme: string
}

const themeClasses: Record<string, string> = {
  modern: 'bg-gradient-to-br from-blue-600 to-indigo-700',
  bold: 'bg-gradient-to-br from-gray-900 to-gray-800',
  classic: 'bg-gradient-to-br from-teal-600 to-emerald-700',
}

export default function HeroSection({ data, theme }: Props) {
  return (
    <section className={`${themeClasses[theme] ?? themeClasses.modern} text-white px-6 py-28 text-center`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">{data.title}</h1>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">{data.subtitle}</p>
        <a
          href="#contact"
          className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          {data.buttonText}
        </a>
      </div>
    </section>
  )
}
