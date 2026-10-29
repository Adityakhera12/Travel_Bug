import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { propertySchema } from '@/lib/validation'

export async function GET() {
  const payload = await getPayloadClient()
  const [propertyResult, reviewResult] = await Promise.all([
    payload.find({
      collection: 'properties',
      depth: 0,
      limit: 100,
      sort: '-createdAt',
      overrideAccess: false,
    }),
    payload.find({
      collection: 'reviews',
      depth: 0,
      limit: 500,
      overrideAccess: false,
    }),
  ])

  const reviewsByProperty = new Map<string, number[]>()
  for (const review of reviewResult.docs) {
    const propertyId =
      typeof review.property === 'object' ? String(review.property.id) : String(review.property)
    reviewsByProperty.set(propertyId, [...(reviewsByProperty.get(propertyId) ?? []), review.rating])
  }

  return NextResponse.json({
    properties: propertyResult.docs.map((property) => {
      const ratings = reviewsByProperty.get(String(property.id)) ?? []
      return {
        id: String(property.id),
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests ?? Math.max(2, property.bedrooms * 2),
        amenities: property.amenities ?? [],
        address: property.address,
        location: property.location,
        image: property.images[0]?.url ?? '',
        images: property.images.map((image) => ({
          url: image.url,
          alt: image.alt,
        })),
        reviewCount: ratings.length,
        rating: ratings.length
          ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
          : null,
      }
    }),
  })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to add a property.' }, { status: 401 })

  const parsed = propertySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check the property details.' },
      { status: 400 },
    )
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const expectedFolder = `haven/properties/${user.id}/`
  const imagesBelongToUser = parsed.data.images.every((image) => {
    const url = new URL(image.url)
    return (
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      image.publicId.startsWith(expectedFolder)
    )
  })
  if (!imagesBelongToUser) {
    return NextResponse.json({ error: 'Upload property images through Travel-Bug first.' }, { status: 400 })
  }

  try {
    const payload = await getPayloadClient()
    const property = await payload.create({
      collection: 'properties',
      data: {
        ...parsed.data,
        owner: user.id,
        status: 'active',
      },
      user,
      overrideAccess: false,
    })
    return NextResponse.json({ property }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'The property could not be saved.' }, { status: 400 })
  }
}
