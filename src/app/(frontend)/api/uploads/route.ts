import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/app-auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to upload images.' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Choose a JPG, PNG, or WebP image up to 8 MB.' },
      { status: 400 },
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `haven/properties/${user.id}`,
      resource_type: 'image',
      transformation: [{ width: 1800, height: 1200, crop: 'limit', quality: 'auto' }],
    })
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch {
    return NextResponse.json({ error: 'The image could not be uploaded.' }, { status: 502 })
  }
}
