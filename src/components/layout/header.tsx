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
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 md:h-24 items-center justify-between gap-4">
          {/* Left Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium flex-1">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-black whitespace-nowrap',
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
          <div className="flex items-center justify-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-faces-cachees.webp"
                alt="Faces cachées Éditions"
                width={240}
                height={96}
                className="h-14 w-auto md:h-20 lg:h-24"
                priority
              />
            </Link>
          </div>

          {/* Right Navigation + Actions */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end">
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
              {navItems.slice(2).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-black whitespace-nowrap',
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
                asChild
              >
                <Link href="/compte">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Compte</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-black text-xs text-white flex items-center justify-center font-semibold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                <span className="sr-only">Panier ({itemCount})</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        <div className="lg:hidden border-t pt-3 pb-3">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center">
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