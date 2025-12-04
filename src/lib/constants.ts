export const SITE_NAME = 'Faces Cachées Éditions'
export const SITE_DESCRIPTION = 'Maison d\'édition dédiée à la découverte de voix singulières et de récits authentiques'

export const BOOK_TYPES = {
  roman: 'Roman',
  autobiographie: 'Autobiographie',
  essai: 'Essai',
  recueil: 'Recueil',
  revue: 'Revue',
  developpement_personnel: 'Développement personnel',
} as const

export const ORDER_STATUS = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
} as const

export const PAYMENT_STATUS = {
  pending: 'En attente',
  paid: 'Payée',
  failed: 'Échouée',
  refunded: 'Remboursée',
} as const

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/facescachees_editions',
  facebook: 'https://www.facebook.com/Facescacheeseditions',
  twitter: 'https://x.com/Editions_FC',
} as const

export const SHIPPING_COST = 4.90
export const FREE_SHIPPING_THRESHOLD = 50
