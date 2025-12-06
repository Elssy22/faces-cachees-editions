'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/livres', label: 'Nos livres' },
  { href: '/auteurs', label: 'Auteurs' },
  { href: '/qui-sommes-nous', label: 'Notre face cachée' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const { getItemCount, setIsOpen } = useCartStore()
  const itemCount = getItemCount()

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      {/* Logo Section */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/logo-faces-cachees.webp"
            alt="Faces cachées Éditions"
            width={280}
            height={112}
            className="h-16 w-auto md:h-20"
            priority
          />
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1">
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-5 py-4 text-sm uppercase tracking-wide font-medium transition-colors hover:bg-gray-50',
                    pathname === item.href
                      ? 'text-black bg-gray-50'
                      : 'text-gray-700'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Account & Cart - Desktop */}
            <div className="hidden md:flex items-center ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-50 px-5 py-4 h-auto rounded-none"
                asChild
              >
                <Link href="/compte">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm uppercase tracking-wide font-medium">
                    Compte
                  </span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-50 px-5 py-4 h-auto rounded-none"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span className="text-sm uppercase tracking-wide font-medium">
                  Panier
                </span>
                {itemCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-black text-xs text-white font-semibold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-50"
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
                className="relative hover:bg-gray-50"
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

          {/* Mobile Navigation */}
          <nav className="md:hidden border-t py-3 flex flex-wrap justify-center gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'uppercase tracking-wide font-medium transition-colors',
                  pathname === item.href
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
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