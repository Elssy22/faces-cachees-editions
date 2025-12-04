'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenNewsletter = localStorage.getItem('newsletter-popup-dismissed')
    const dismissedAt = hasSeenNewsletter ? parseInt(hasSeenNewsletter) : 0
    const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)

    // Show popup if never seen or if more than 30 days have passed
    if (!hasSeenNewsletter || daysSinceDismissed > 30) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent || !email.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        localStorage.setItem('newsletter-popup-dismissed', Date.now().toString())
        
        // Close popup after success message
        setTimeout(() => {
          setOpen(false)
        }, 2000)
      } else {
        throw new Error('Subscription failed')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLaterClick = () => {
    setOpen(false)
    // Set a shorter dismissal time for "later" (7 days)
    localStorage.setItem('newsletter-popup-dismissed', (Date.now() - (23 * 24 * 60 * 60 * 1000)).toString())
  }

  const handleCloseClick = () => {
    setOpen(false)
    localStorage.setItem('newsletter-popup-dismissed', Date.now().toString())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left side - Logo */}
          <div className="bg-gray-50 flex items-center justify-center p-8">
            <Image
              src="/logo-faces-cachees.png"
              alt="Faces cachées Éditions"
              width={200}
              height={80}
              className="w-auto h-auto max-w-full"
              priority
            />
          </div>

          {/* Right side - Form */}
          <div className="p-8 flex flex-col justify-center">
            {!isSubmitted ? (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Restez informé(e)
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Pour suivre toute l'actualité de la maison (sorties de livres, dédicaces, événements…)
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="newsletter-consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                      required
                    />
                    <label 
                      htmlFor="newsletter-consent" 
                      className="text-xs text-gray-600 leading-relaxed"
                    >
                      J'accepte de recevoir la newsletter de Faces cachées Éditions et je confirme avoir pris connaissance de la{' '}
                      <button
                        type="button"
                        onClick={handleCloseClick}
                        className="underline hover:no-underline"
                      >
                        politique de confidentialité
                      </button>.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      disabled={!consent || !email.trim() || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleLaterClick}
                      className="flex-1"
                    >
                      Plus tard
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Merci !</h3>
                <p className="text-gray-600 text-sm">
                  Votre inscription à la newsletter a été confirmée.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}