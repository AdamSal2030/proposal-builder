'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface ProposalSummary {
  id: string
  title: string
  slug: string
  status: string
  clientName: string | null
  createdAt: string
  updatedAt: string
  uploads: { id: string; filename: string }[]
}

export default function Dashboard() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    const res = await fetch('/api/proposals')
    const data = await res.json()
    setProposals(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    setDeleting(id)
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    setProposals((prev) => prev.filter((p) => p.id !== id))
    setDeleting(null)
  }

  const filtered = proposals.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.clientName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">ProposalCraft</span>
          </Link>
          <Link href="/library" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            Library
          </Link>
        </div>
        <Link
          href="/proposals/new"
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Proposals</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">
                {proposals.length} total
              </p>
            )}
          </div>
          {proposals.length > 0 && (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search proposals…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 w-56 transition-all"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">No proposals yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first proposal and share it with clients</p>
            <Link href="/proposals/new" className="inline-flex items-center gap-1.5 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Proposal
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No proposals match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                {/* Status + date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'published' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-400 font-medium capitalize">{p.status}</span>
                  </div>
                  <span className="text-xs text-gray-300">{formatDate(p.updatedAt)}</span>
                </div>

                {/* Title + client */}
                <h2 className="font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2 group-hover:text-black transition-colors">
                  {p.title}
                </h2>
                {p.clientName ? (
                  <p className="text-sm text-gray-400 mb-4">for {p.clientName}</p>
                ) : (
                  <p className="text-sm text-gray-300 mb-4 italic">No client</p>
                )}

                {/* Separator */}
                <div className="border-t border-gray-50 pt-4 flex items-center gap-2">
                  <Link
                    href={`/proposals/${p.id}`}
                    className="flex-1 text-center bg-gray-900 text-white text-sm font-medium py-1.5 rounded-lg hover:bg-black transition-colors"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/proposals/${p.id}/preview`}
                    target="_blank"
                    className="flex-1 text-center border border-gray-200 text-gray-600 text-sm font-medium py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    disabled={deleting === p.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
