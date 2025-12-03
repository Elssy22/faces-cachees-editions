import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Book } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (book: Book) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
  setIsOpen: (isOpen: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (book: Book) => {
        const items = get().items
        const existingItem = items.find(item => item.bookId === book.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.bookId === book.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          const newItem: CartItem = {
            id: `${book.id}-${Date.now()}`,
            bookId: book.id,
            book,
            quantity: 1,
            createdAt: new Date().toISOString()
          }
          set({ items: [...items, newItem] })
        }
      },
      
      removeItem: (itemId: string) => {
        set({
          items: get().items.filter(item => item.id !== itemId)
        })
      },
      
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.book.price * item.quantity,
          0
        )
      },
      
      setIsOpen: (isOpen: boolean) => {
        set({ isOpen })
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
)