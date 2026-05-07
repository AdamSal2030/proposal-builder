import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadToCloudinary } from '@/lib/cloudinary'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm',
]

export async function GET() {
  const assets = await prisma.libraryAsset.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(assets)
}

export async function POST(request: NextRequest) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return Response.json({ error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment.' }, { status: 503 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 50MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await uploadToCloudinary(buffer, file.type)

  const asset = await prisma.libraryAsset.create({
    data: {
      filename: file.name,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width ?? null,
      height: result.height ?? null,
      format: result.format ?? null,
      size: file.size,
    },
  })

  return Response.json(asset, { status: 201 })
}
