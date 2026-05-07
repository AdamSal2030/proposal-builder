import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { saveFile, deleteStoredFile } from '@/lib/storage'

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
      return `[PDF: ${filename} — text extraction unavailable]`
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
      return `[Word doc: ${filename} — text extraction unavailable]`
    }
  }

  return `[${filename} — text extraction not supported for this format]`
}

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) return Response.json({ error: 'Proposal not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const [filePath, extractedText] = await Promise.all([
    saveFile(buffer, file.name),
    extractText(buffer, file.type, file.name),
  ])

  const upload = await prisma.upload.create({
    data: {
      proposalId: id,
      filename: file.name,
      path: filePath,
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

  const upload = await prisma.upload.findUnique({ where: { id: uploadId, proposalId: id } })
  if (upload) {
    await deleteStoredFile(upload.path)
    await prisma.upload.delete({ where: { id: uploadId } })
  }

  return Response.json({ success: true })
}
