import type { Access, CollectionBeforeValidateHook, CollectionConfig, Where } from 'payload'

const ownerOnly: Access = ({ req }) =>
  req.user?.collection === 'users' ? { owner: { equals: req.user.id } } : false

const attachOwner: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.collection === 'users') {
    return { ...data, owner: req.user.id }
  }
  return data
}

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    group: 'Marketplace',
    useAsTitle: 'title',
  },
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    read: ({ req }) => {
      if (req.user?.collection !== 'users') {
        return { status: { equals: 'active' } }
      }
      const where: Where = {
        or: [
          { status: { equals: 'active' } },
          { owner: { equals: req.user.id } },
        ],
      }
      return where
    },
    update: ownerOnly,
    delete: ownerOnly,
  },
  hooks: {
    beforeValidate: [attachOwner],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 1200,
    },
    {
      name: 'propertyType',
      type: 'select',
      required: true,
      options: ['apartment', 'house', 'loft', 'townhouse'],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'bedrooms',
      type: 'number',
      required: true,
      min: 0,
      max: 20,
    },
    {
      name: 'bathrooms',
      type: 'number',
      required: true,
      min: 1,
      max: 20,
    },
    {
      name: 'maxGuests',
      type: 'number',
      min: 1,
      max: 40,
      admin: {
        description: 'Maximum number of overnight guests.',
      },
    },
    {
      name: 'amenities',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Wi-Fi', value: 'wifi' },
        { label: 'Pool', value: 'pool' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Parking', value: 'parking' },
        { label: 'Air conditioning', value: 'air-conditioning' },
        { label: 'Workspace', value: 'workspace' },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true, maxLength: 120 },
        { name: 'city', type: 'text', required: true, maxLength: 80 },
        { name: 'region', type: 'text', required: true, maxLength: 80 },
      ],
    },
    {
      name: 'location',
      type: 'point',
      required: true,
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'url', type: 'text', required: true },
        { name: 'publicId', type: 'text', required: true },
        { name: 'alt', type: 'text', required: true, maxLength: 140 },
      ],
    },
    {
      name: 'owner',
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
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      required: true,
      options: ['active', 'rented', 'archived'],
      access: {
        create: () => false,
      },
    },
  ],
  versions: false,
}
