import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

const useBlob = () =>
  typeof process.env.BLOB_READ_WRITE_TOKEN === 'string' &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 0

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  folder: string = 'uploads'
): Promise<string> {
  const ext = originalName.split('.').pop() ?? 'bin'
  const filename = `${nanoid()}.${ext}`

  if (useBlob()) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`${folder}/${filename}`, buffer, { access: 'public' })
    return blob.url
  }

  const dir = join(process.cwd(), 'public', folder)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), buffer)
  return `/${folder}/${filename}`
}

export async function saveImage(buffer: Buffer, originalName: string): Promise<string> {
  return saveFile(buffer, originalName, 'uploads/images')
}

export async function deleteStoredFile(url: string): Promise<void> {
  if (useBlob() && url.startsWith('https://')) {
    const { del } = await import('@vercel/blob')
    await del(url)
  }
}
