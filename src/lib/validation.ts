import { z } from 'zod'

export const authSchema = z.object({
  mode: z.enum(['login', 'register']),
  name: z.string().trim().min(2).max(80).optional(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
})

export const propertySchema = z.object({
  title: z.string().trim().min(4).max(100),
  description: z.string().trim().min(30).max(1200),
  propertyType: z.enum(['apartment', 'house', 'loft', 'townhouse']),
  price: z.number().positive().max(1_000_000),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(20),
  maxGuests: z.number().int().min(1).max(40).optional(),
  amenities: z
    .array(z.enum(['wifi', 'pool', 'kitchen', 'parking', 'air-conditioning', 'workspace']))
    .max(6)
    .optional(),
  address: z.object({
    line1: z.string().trim().min(4).max(120),
    city: z.string().trim().min(2).max(80),
    region: z.string().trim().min(2).max(80),
  }),
  location: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
  images: z
    .array(
      z.object({
        url: z.url().refine((value) => value.startsWith('https://res.cloudinary.com/')),
        publicId: z.string().min(1).max(220),
        alt: z.string().trim().min(3).max(140),
      }),
    )
    .min(1)
    .max(8),
})

export const reviewSchema = z.object({
  property: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(600),
})
