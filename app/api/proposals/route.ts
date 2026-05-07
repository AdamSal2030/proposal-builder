import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function GET() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { uploads: { select: { id: true, filename: true } } },
  })
  return Response.json(proposals)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, clientName, clientEmail } = body

  if (!title?.trim()) {
    return Response.json({ error: 'Title is required' }, { status: 400 })
  }

  const slug = slugify(title)
  const proposal = await prisma.proposal.create({
    data: {
      title: title.trim(),
      slug,
      clientName: clientName?.trim() || null,
      clientEmail: clientEmail?.trim() || null,
      sections: '[]',
    },
  })

  return Response.json(proposal, { status: 201 })
}
