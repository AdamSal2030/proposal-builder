import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateProposalSections } from '@/lib/claude'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local to use AI features.' },
      { status: 503 }
    )
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { uploads: { select: { extractedText: true, filename: true } } },
  })
  if (!proposal) return Response.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const { description } = body as { description?: string }

  let inputText = description || ''

  if (proposal.uploads.length > 0) {
    const uploadedContent = proposal.uploads
      .filter((u: { extractedText: string | null; filename: string }) => u.extractedText)
      .map((u: { extractedText: string | null; filename: string }) => `--- ${u.filename} ---\n${u.extractedText}`)
      .join('\n\n')
    if (uploadedContent) {
      inputText = inputText ? `${inputText}\n\n${uploadedContent}` : uploadedContent
    }
  }

  if (!inputText.trim()) {
    return Response.json(
      { error: 'Provide a description or upload files to generate content.' },
      { status: 400 }
    )
  }

  const sections = await generateProposalSections(inputText, proposal.title)

  const updated = await prisma.proposal.update({
    where: { id },
    data: { sections: JSON.stringify(sections) },
    include: { uploads: true },
  })

  return Response.json(updated)
}
