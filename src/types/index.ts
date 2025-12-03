export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string
  role: 'admin' | 'editor' | 'client'
  createdAt: string
  updatedAt: string
}

export interface Author {
  id: string
  firstName: string
  lastName: string
  bio?: string
  photoUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Book {
  id: string
  title: string
  subtitle?: string
  slug: string
  authorId: string
  author?: Author
  price: number
  summary: string
  coverImageUrl?: string
  bookType: BookType
  genre?: string
  tags?: string[]
  pageCount?: number
  dimensions?: string
  formatType?: string
  ean?: string
  isbn?: string
  publicationDate?: string
  status: PublishStatus
  createdAt: string
  updatedAt: string
  mediaRelays?: MediaRelay[]
}

export interface MediaRelay {
  id: string
  bookId: string
  type: 'instagram' | 'article' | 'video' | 'podcast'
  url: string
  title?: string
  createdAt: string
}

export interface CartItem {
  id: string
  bookId: string
  book: Book
  quantity: number
  createdAt: string
}

export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  shippingAddress: Address
  paymentMethod?: string
  paymentStatus: PaymentStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  bookId: string
  book: Book
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
}

export interface Address {
  id?: string
  userId?: string
  type: 'billing' | 'shipping'
  street: string
  city: string
  postalCode: string
  country: string
  createdAt?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  location: string
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  tags?: string[]
  status: PublishStatus
  publishedAt?: string
  authorId?: string
  author?: User
  createdAt: string
  updatedAt: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  userId?: string
  active: boolean
  consentDate: string
  unsubscribedAt?: string
  createdAt: string
}

export type BookType = 
  | 'roman' 
  | 'autobiographie' 
  | 'essai' 
  | 'recueil' 
  | 'revue' 
  | 'developpement_personnel'

export type PublishStatus = 'draft' | 'scheduled' | 'published'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'