import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'

type Context = { params: Promise<{ id: string }> }

async function extractText(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
  if (mimetype === 'text/plain' || filename.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }

  if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = await import('pdf-parse') as any
      const data = await (pdfParse.default ?? pdfParse)(buffer)
      return data.text
    } catch {
      return `[PDF: ${filename} — install pdf-parse to extract text]`
    }
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch {
      return `[Word doc: ${filename} — install mammoth to extract text]`
    }
  }

  return `[File: ${filename} — text extraction not supported for this format]`
}

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) return Response.json({ error: 'Proposal not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop() || 'bin'
  const savedName = `${nanoid()}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filePath = join(uploadDir, savedName)

  await writeFile(filePath, buffer)

  const extractedText = await extractText(buffer, file.type, file.name)

  const upload = await prisma.upload.create({
    data: {
      proposalId: id,
      filename: file.name,
      path: `/uploads/${savedName}`,
      mimetype: file.type,
      size: file.size,
      extractedText,
    },
  })

  return Response.json(upload, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get('uploadId')
  if (!uploadId) return Response.json({ error: 'uploadId required' }, { status: 400 })

  await prisma.upload.delete({ where: { id: uploadId, proposalId: id } })
  return Response.json({ success: true })
}
