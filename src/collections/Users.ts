import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  access: {
    create: () => true,
    read: ({ req }) =>
      req.user?.collection === 'users' ? { id: { equals: req.user.id } } : false,
    update: ({ req }) =>
      req.user?.collection === 'users' ? { id: { equals: req.user.id } } : false,
    delete: ({ req }) =>
      req.user?.collection === 'users' ? { id: { equals: req.user.id } } : false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
  ],
  versions: false,
}
