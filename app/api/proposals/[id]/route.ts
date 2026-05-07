import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { uploads: true },
  })
  if (!proposal) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(proposal)
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params
  const body = await request.json()
  const { title, clientName, clientEmail, sections, theme, status } = body

  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title
  if (clientName !== undefined) data.clientName = clientName
  if (clientEmail !== undefined) data.clientEmail = clientEmail
  if (sections !== undefined) data.sections = JSON.stringify(sections)
  if (theme !== undefined) data.theme = theme
  if (status !== undefined) data.status = status

  const proposal = await prisma.proposal.update({
    where: { id },
    data,
    include: { uploads: true },
  })
  return Response.json(proposal)
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params
  await prisma.proposal.delete({ where: { id } })
  return Response.json({ success: true })
}
