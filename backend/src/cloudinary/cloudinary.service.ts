import { Injectable } from '@nestjs/common'
import { Readable } from 'stream'
import cloudinary from '../config/cloudinary.config'

@Injectable()
export class CloudinaryService {
  async uploadImage(buffer: Buffer): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error || !result) {
          reject(new Error(error?.message ?? 'Cloudinary upload failed'))
          return
        }

        resolve({ url: result.secure_url, publicId: result.public_id })
      })

      Readable.from(buffer).pipe(uploadStream)
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
  }
}
