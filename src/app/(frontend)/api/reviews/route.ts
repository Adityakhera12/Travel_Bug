import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { reviewSchema } from '@/lib/validation'

export async function GET(request: Request) {
  const property = new URL(request.url).searchParams.get('property')
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'reviews',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    where: property ? { property: { equals: property } } : undefined,
    overrideAccess: false,
  })

  return NextResponse.json({
    reviews: result.docs.map((review) => ({
      id: String(review.id),
      property:
        typeof review.property === 'object' ? String(review.property.id) : String(review.property),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      author:
        typeof review.author === 'object'
          ? { name: review.author.name }
          : { name: 'Travel Bug guest' },
    })),
  })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to leave a review.' }, { status: 401 })

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check your review.' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayloadClient()
    const property = await payload.findByID({
      collection: 'properties',
      id: parsed.data.property,
      user,
      overrideAccess: false,
    })
    if (!property) return NextResponse.json({ error: 'Property not found.' }, { status: 404 })

    const review = await payload.create({
      collection: 'reviews',
      data: {
        ...parsed.data,
        author: user.id,
        approved: true,
      },
      user,
      overrideAccess: false,
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'The review could not be saved.' }, { status: 400 })
  }
}
