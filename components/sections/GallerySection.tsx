'use client'
import type { GalleryData } from '@/lib/types'

interface Props { data: GalleryData; theme: string }

const accents: Record<string, string> = {
  modern: 'from-blue-500 to-indigo-600',
  bold: 'from-orange-500 to-amber-500',
  classic: 'from-teal-500 to-emerald-600',
}

export default function GallerySection({ data, theme }: Props) {
  const accent = accents[theme] ?? accents.modern
  const images = data.images ?? []
  const cols = data.columns ?? 3

  if (images.length === 0) return null

  // Hero layout: 1 image
  if (images.length === 1) {
    return (
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeader data={data} accent={accent} />
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img src={images[0].url} alt={images[0].caption ?? ''} className="w-full max-h-[70vh] object-cover" />
            {images[0].caption && <p className="text-center text-sm text-gray-400 py-3 bg-gray-50">{images[0].caption}</p>}
          </div>
        </div>
      </section>
    )
  }

  // Side-by-side: 2 images
  if (images.length === 2) {
    return (
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeader data={data} accent={accent} />
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-lg">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500" />
                {img.caption && <p className="text-center text-sm text-gray-400 py-2 bg-gray-50">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // 3 images: 1 large + 2 stacked
  if (images.length === 3) {
    return (
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeader data={data} accent={accent} />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden shadow-lg row-span-2">
              <img src={images[0].url} alt={images[0].caption ?? ''} className="w-full h-full object-cover min-h-[400px] hover:scale-105 transition-transform duration-500" />
            </div>
            {images.slice(1).map((img, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-lg">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // 4 images: 2x2 grid
  if (images.length === 4) {
    return (
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeader data={data} accent={accent} />
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-lg">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" />
                {img.caption && <p className="text-center text-sm text-gray-400 py-2 bg-gray-50">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // 5+ images: masonry-style grid
  const colCount = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeader data={data} accent={accent} />
        <div className={`grid ${colCount} gap-4`}>
          {images.map((img, i) => (
            <div
              key={i}
              className={`rounded-3xl overflow-hidden shadow-lg ${i === 0 && images.length >= 5 ? 'col-span-2' : ''}`}
            >
              <img
                src={img.url}
                alt={img.caption ?? ''}
                className={`w-full object-cover hover:scale-105 transition-transform duration-500 ${i === 0 && images.length >= 5 ? 'h-80' : 'h-56'}`}
              />
              {img.caption && <p className="text-center text-sm text-gray-400 py-2 bg-gray-50">{img.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeader({ data, accent }: { data: GalleryData; accent: string }) {
  if (!data.title) return null
  return (
    <div className="mb-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-3">{data.title}</h2>
      <div className={`w-14 h-1 bg-gradient-to-r ${accent} rounded-full mb-4`} />
      {data.subtitle && <p className="text-gray-500 text-lg">{data.subtitle}</p>}
    </div>
  )
}
