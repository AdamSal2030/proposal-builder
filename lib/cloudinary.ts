import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
  original_filename: string
}

export async function uploadToCloudinary(
  buffer: Buffer,
  mimetype: string,
  folder = 'proposal-builder'
): Promise<CloudinaryResult> {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      { folder, resource_type: 'auto' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'))
        resolve(result as CloudinaryResult)
      }
    )
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
