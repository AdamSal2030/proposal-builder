import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import type { Section } from '@/lib/types'
import ProposalRenderer from '@/components/ProposalRenderer'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proposal = await prisma.proposal.findUnique({ where: { slug } })
  if (!proposal || proposal.status !== 'published') return { title: 'Proposal Not Found' }
  return {
    title: proposal.title,
    description: proposal.clientName ? `Proposal for ${proposal.clientName}` : 'View this proposal',
  }
}

export default async function PublicProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proposal = await prisma.proposal.findUnique({ where: { slug } })

  if (!proposal || proposal.status !== 'published') notFound()

  let sections: Section[] = []
  try {
    const parsed = JSON.parse(proposal.sections)
    sections = Array.isArray(parsed) ? parsed : []
  } catch { /* empty */ }

  return (
    <div className="min-h-screen bg-white">
      <ProposalRenderer sections={sections} theme={proposal.theme} />
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100">
        Created with <span className="font-medium text-gray-600">ProposalCraft</span>
      </footer>
    </div>
  )
}
