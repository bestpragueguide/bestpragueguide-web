export const categoryLabels: Record<string, Record<string, string>> = {
  en: {
    'prague-guide': 'Prague Guide',
    'food-and-drink': 'Food & Drink',
    'day-trips': 'Day Trips',
    'tips': 'Tips',
    'history': 'History',
  },
  ru: {
    'prague-guide': 'Гид по Праге',
    'food-and-drink': 'Еда и напитки',
    'day-trips': 'Поездки из Праги',
    'tips': 'Советы',
    'history': 'История',
  },
}

export const allCategories = ['prague-guide', 'food-and-drink', 'day-trips', 'tips', 'history'] as const

export type BlogCategory = (typeof allCategories)[number]
