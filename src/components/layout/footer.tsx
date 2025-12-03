import Link from 'next/link'
import { Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Social Media Icons */}
          <div className="flex space-x-6">
            <Link
              href="https://www.instagram.com/facescachees_editions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="https://www.facebook.com/Facescacheeseditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="https://x.com/Editions_FC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Twitter className="h-6 w-6" />
              <span className="sr-only">X (Twitter)</span>
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-center">
            <Link 
              href="/cgv" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Conditions générales de vente
            </Link>
            <Link 
              href="/donnees-personnelles" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Charte sur les données personnelles
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Faces cachées Éditions. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  )
}