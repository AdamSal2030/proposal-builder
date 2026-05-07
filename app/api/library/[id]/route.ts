import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { deleteFromCloudinary } from '@/lib/cloudinary'

type Context = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params
  const asset = await prisma.libraryAsset.findUnique({ where: { id } })
  if (!asset) return Response.json({ error: 'Not found' }, { status: 404 })

  const resourceType = asset.format && ['mp4', 'webm', 'mov'].includes(asset.format) ? 'video' : 'image'
  await deleteFromCloudinary(asset.publicId, resourceType).catch(() => null)
  await prisma.libraryAsset.delete({ where: { id } })

  return Response.json({ success: true })
}
