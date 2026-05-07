'use client'
import type { HeroData } from '@/lib/types'

interface Props {
  data: HeroData
  theme: string
}

const gradients: Record<string, string> = {
  modern: 'from-blue-600 via-indigo-600 to-violet-700',
  bold: 'from-gray-900 via-gray-800 to-zinc-900',
  classic: 'from-teal-600 via-emerald-600 to-green-700',
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/)
  return m ? m[1] : null
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

export default function HeroSection({ data, theme }: Props) {
  const { title, subtitle, buttonText, backgroundType = 'gradient', backgroundImage, backgroundVideo, overlayOpacity = 50 } = data
  const gradient = gradients[theme] ?? gradients.modern
  const overlay = Math.max(0, Math.min(100, overlayOpacity))

  const ytId = backgroundType === 'video' && backgroundVideo ? getYouTubeId(backgroundVideo) : null
  const vimeoId = backgroundType === 'video' && backgroundVideo && !ytId ? getVimeoId(backgroundVideo) : null
  const isDirectVideo = backgroundType === 'video' && backgroundVideo && !ytId && !vimeoId

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layer */}
      {backgroundType === 'gradient' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {backgroundType === 'image' && backgroundImage && (
        <img
          src={backgroundImage}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {backgroundType === 'video' && ytId && (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&playsinline=1&rel=0&showinfo=0`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(1.1)' }}
          allow="autoplay; encrypted-media"
          title="Background video"
        />
      )}

      {backgroundType === 'video' && vimeoId && (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(1.1)' }}
          allow="autoplay; encrypted-media"
          title="Background video"
        />
      )}

      {backgroundType === 'video' && isDirectVideo && (
        <video
          src={backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay — always shown for image/video, optional tint for gradient */}
      {backgroundType !== 'gradient' && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlay / 100 }}
        />
      )}
      {backgroundType === 'gradient' && (
        <div className="absolute inset-0 bg-black/10" />
      )}

      {/* Decorative blobs for gradient mode */}
      {backgroundType === 'gradient' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6 drop-shadow-sm">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/90 hover:scale-105 transition-all shadow-2xl"
        >
          {buttonText}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
