import type { Access, CollectionBeforeValidateHook, CollectionConfig, Where } from 'payload'

const authorOnly: Access = ({ req }) =>
  req.user?.collection === 'users' ? { author: { equals: req.user.id } } : false

const attachAuthor: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.collection === 'users') {
    return { ...data, author: req.user.id, approved: true }
  }
  return data
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Marketplace',
    useAsTitle: 'comment',
  },
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    read: ({ req }) => {
      if (req.user?.collection !== 'users') {
        return { approved: { equals: true } }
      }
      const where: Where = {
        or: [
          { approved: { equals: true } },
          { author: { equals: req.user.id } },
        ],
      }
      return where
    },
    update: authorOnly,
    delete: authorOnly,
  },
  hooks: {
    beforeValidate: [attachAuthor],
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 600,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      access: {
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
  ],
  versions: false,
}
