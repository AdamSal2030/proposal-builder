import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

type Context = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  const { slug } = await params
  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: { uploads: { select: { id: true, filename: true } } },
  })
  if (!proposal || proposal.status !== 'published') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json(proposal)
}
