import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'pricingModel'],
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Entry Ticket', value: 'ENTRY_TICKET' },
        { label: 'Vehicle', value: 'VEHICLE' },
        { label: 'Restaurant', value: 'RESTAURANT' },
        { label: 'Driver', value: 'DRIVER' },
        { label: 'Boat Ticket', value: 'BOAT_TICKET' },
        { label: 'Audio Headset', value: 'AUDIO_HEADSET' },
        { label: 'VR Experience', value: 'VR' },
        { label: 'Other', value: 'OTHER' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'pricingModel',
      type: 'select',
      required: true,
      options: [
        { label: 'Per Person', value: 'PER_PERSON' },
        { label: 'Group Tiers', value: 'GROUP_TIERS' },
        { label: 'Flat Rate', value: 'FLAT' },
        { label: 'On Request', value: 'ON_REQUEST' },
      ],
    },
    {
      name: 'requireGuestBreakdown',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (data) => data?.pricingModel === 'PER_PERSON',
        description: 'Customer must allocate guests to each category (total must equal group size). Typical for entry tickets.',
      },
    },
    {
      name: 'guestCategoryPricing',
      type: 'array',
      admin: {
        condition: (data) => data?.pricingModel === 'PER_PERSON',
        description: 'Price per person by guest age category',
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'ageMin', type: 'number' },
        { name: 'ageMax', type: 'number', admin: { description: 'Leave empty for no upper limit' } },
        { name: 'price', type: 'number', admin: { description: 'Price in EUR. Leave empty if free or on request.' } },
        { name: 'isFree', type: 'checkbox', defaultValue: false },
        { name: 'onRequest', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'groupTierPricing',
      type: 'array',
      admin: {
        condition: (data) => data?.pricingModel === 'GROUP_TIERS',
        description: 'Price per group size range',
      },
      fields: [
        { name: 'minGuests', type: 'number', required: true },
        { name: 'maxGuests', type: 'number', admin: { description: 'Leave empty for no upper limit' } },
        { name: 'price', type: 'number', admin: { description: 'Price in EUR. Leave empty if on request.' } },
        { name: 'onRequest', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'flatPrice',
      type: 'number',
      admin: {
        condition: (data) => data?.pricingModel === 'FLAT',
        description: 'Flat price in EUR',
      },
    },
    {
      name: 'onRequestThreshold',
      type: 'number',
      admin: {
        description: 'Groups larger than this trigger "contact us" pricing',
      },
    },
  ],
}
