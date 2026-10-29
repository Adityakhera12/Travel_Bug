export type PropertyView = {
  id: string
  title: string
  description: string
  propertyType: string
  price: number
  bedrooms: number
  bathrooms: number
  maxGuests: number
  amenities: string[]
  address: { line1: string; city: string; region: string }
  location: [number, number]
  image: string
  images: { url: string; alt: string }[]
  reviewCount: number
  rating: number | null
}

export type ReviewView = {
  id: string
  property: string
  rating: number
  comment: string
  createdAt: string
  author: { name: string }
}

export type UserView = { id: string; name: string; email: string } | null
