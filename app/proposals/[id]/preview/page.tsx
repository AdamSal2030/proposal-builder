'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Section } from '@/lib/types'
import ProposalRenderer from '@/components/ProposalRenderer'

interface ProposalData {
  id: string
  title: string
  slug: string
  status: string
  theme: string
  clientName: string | null
  sections: string
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((r) => r.json())
      .then((data: ProposalData) => {
        setProposal(data)
        try {
          const parsed = JSON.parse(data.sections)
          setSections(Array.isArray(parsed) ? parsed : [])
        } catch { setSections([]) }
      })
      .catch(() => router.push('/'))
  }, [id, router])

  const copyLink = async () => {
    const url = `${window.location.origin}/p/${proposal?.slug}`
    await navigator.clipboard.writeText(url)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview toolbar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/proposals/${id}`} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Edit
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-sm text-gray-300">{proposal.title}</span>
          {proposal.status === 'published' && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Published</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {proposal.status === 'published' && (
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              {copying ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <ProposalRenderer sections={sections} theme={proposal.theme} />
    </div>
  )
}
