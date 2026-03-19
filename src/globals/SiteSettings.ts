import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              defaultValue: 'Best Prague Guide',
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
            },
            {
              name: 'contactPhone',
              type: 'text',
              admin: {
                description: 'International format without spaces (e.g. +420776306858)',
              },
            },
            {
              name: 'contactPhoneDisplay',
              type: 'text',
              admin: {
                description: 'Display format (e.g. +420 776 306 858)',
              },
            },
            {
              name: 'whatsappNumber',
              type: 'text',
              admin: {
                description: 'Number without + (e.g. 420776306858)',
              },
            },
            {
              name: 'whatsappMessageTemplate',
              type: 'text',
              localized: true,
              admin: {
                description: 'Default message when user clicks WhatsApp button (general)',
              },
            },
            {
              name: 'whatsappTourMessageTemplate',
              type: 'text',
              localized: true,
              admin: {
                description: 'Message when clicking WhatsApp from a tour page. Use {tourName} placeholder.',
              },
            },
            {
              name: 'telegramHandle',
              type: 'text',
            },
            {
              name: 'businessHours',
              type: 'text',
              defaultValue: '09:00–20:00 CET',
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'instagramHandle',
              type: 'text',
              admin: {
                description: 'Without @ (e.g. bestpragueguide)',
              },
            },
            {
              name: 'socialLinks',
              type: 'group',
              fields: [
                {
                  name: 'instagramUrl',
                  type: 'text',
                },
                {
                  name: 'youtubeUrl',
                  type: 'text',
                },
                {
                  name: 'tripAdvisorUrl',
                  type: 'text',
                },
                {
                  name: 'googleBusinessUrl',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            {
              name: 'mapUrl',
              type: 'text',
              admin: { description: 'Google Maps link to the business location' },
            },
            {
              name: 'licenseText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Guide association license text',
              },
            },
            {
              name: 'copyrightText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Use {year} as placeholder for the current year',
              },
            },
          ],
        },
        {
          label: 'Booking',
          fields: [
            {
              name: 'bookingPricingDescription',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Pricing explanation shown above the booking form in the sidebar (e.g. "Price is per group, not per person")',
              },
            },
            {
              name: 'bookingFormTitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Heading above the booking form (e.g. "Book This Tour")',
              },
            },
            {
              name: 'bookingSubmitLabel',
              type: 'text',
              localized: true,
              admin: {
                description: 'Submit button text (e.g. "Submit Request")',
              },
            },
            {
              name: 'bookingSuccessTitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Heading shown after successful booking (e.g. "Request Received!")',
              },
            },
            {
              name: 'bookingSuccessMessage',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Message shown after successful booking (e.g. "Thank you! We received your request...")',
              },
            },
            {
              name: 'bookingDisclaimerText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Small text below the submit button (e.g. "By submitting you agree to be contacted about your request.")',
              },
            },
            {
              name: 'bookingConsentText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Consent checkbox text. Use [terms] and [privacy] as link placeholders (e.g. "I agree to the [terms] and [privacy]")',
              },
            },
            {
              name: 'bookingTrustBadges',
              type: 'array',
              labels: {
                singular: 'Trust Badge',
                plural: 'Trust Badges',
              },
              admin: {
                description: 'Checkmark badges shown below the booking form (e.g. "No payment until we confirm")',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Booking Page',
          fields: [
            {
              name: 'bookingPageConfirmedMessage',
              type: 'text',
              localized: true,
              admin: { description: 'Banner message when payment required (e.g., "Your booking is confirmed! Complete payment to secure your spot.")' },
            },
            {
              name: 'bookingPagePaymentNote',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Note in payment section (e.g., "Your deposit secures the date.")',
              },
            },
            {
              name: 'bookingPageCashNote',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Note for cash-only payment',
              },
            },
            {
              name: 'bookingPageContactNote',
              type: 'text',
              localized: true,
              admin: { description: 'Text in contact section (e.g., "Contact us via WhatsApp, email, or phone")' },
            },
            {
              name: 'bookingPageExpiredHeading',
              type: 'text',
              localized: true,
              admin: {
                description: 'Heading when offer expired',
              },
            },
            {
              name: 'bookingPageExpiredMessage',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Message when offer expired',
              },
            },
          ],
        },
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'text',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'link',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
