import { NextRequest } from 'next/server'
import { saveImage } from '@/lib/storage'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return Response.json(
      { error: 'Unsupported file type. Use JPEG, PNG, GIF, WebP, SVG, MP4, or WebM.' },
      { status: 400 }
    )
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > maxSize) {
    return Response.json({ error: `File too large (max ${isVideo ? '100' : '10'}MB)` }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const url = await saveImage(buffer, file.name)

  return Response.json({ url, type: isVideo ? 'video' : 'image' }, { status: 201 })
}
