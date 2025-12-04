'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/livres', label: 'Tous les livres' },
  { href: '/auteurs', label: 'Nos auteurs' },
  { href: '/contact', label: 'Nous contacter' },
  { href: '/qui-sommes-nous', label: 'Qui sommes-nous' },
  { href: '/blog', label: 'Le blog' },
]

export function Header() {
  const pathname = usePathname()
  const { getItemCount, setIsOpen } = useCartStore()
  const itemCount = getItemCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-black',
                  pathname === item.href
                    ? 'text-black font-semibold'
                    : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logo centered */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-faces-cachees.svg"
                alt="Faces cachées Éditions"
                width={150}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right Navigation + Actions */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navItems.slice(2).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-black',
                    pathname === item.href
                      ? 'text-black font-semibold'
                      : 'text-gray-600'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Account & Cart Icons */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/compte">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Compte</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-black text-xs text-white flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                <span className="sr-only">Panier ({itemCount})</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t pt-4 pb-2">
          <nav className="flex flex-wrap gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-black',
                  pathname === item.href
                    ? 'text-black font-semibold'
                    : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}