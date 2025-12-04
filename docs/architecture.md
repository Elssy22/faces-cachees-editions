# Architecture du projet Faces Cachées Éditions

## Structure des dossiers

```
faces-cachees-editions/
├── src/
│   ├── app/                          # App Router Next.js
│   │   ├── (public)/                 # Routes publiques (sans auth)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Page d'accueil
│   │   │   ├── livres/
│   │   │   │   ├── page.tsx          # Catalogue tous les livres
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Page produit livre
│   │   │   ├── auteurs/
│   │   │   │   └── page.tsx          # Liste des auteurs
│   │   │   ├── contact/
│   │   │   │   └── page.tsx          # Formulaire de contact
│   │   │   ├── qui-sommes-nous/
│   │   │   │   └── page.tsx          # À propos
│   │   │   └── blog/
│   │   │       ├── page.tsx          # Liste articles
│   │   │       └── [slug]/
│   │   │           └── page.tsx      # Article détaillé
│   │   ├── (auth)/                   # Routes d'authentification
│   │   │   ├── connexion/
│   │   │   │   └── page.tsx
│   │   │   ├── inscription/
│   │   │   │   └── page.tsx
│   │   │   └── mot-de-passe-oublie/
│   │   │       └── page.tsx
│   │   ├── (protected)/              # Routes protégées (client loggé)
│   │   │   ├── layout.tsx
│   │   │   ├── compte/
│   │   │   │   ├── page.tsx          # Tableau de bord client
│   │   │   │   ├── informations/
│   │   │   │   │   └── page.tsx      # Éditer profil
│   │   │   │   ├── commandes/
│   │   │   │   │   ├── page.tsx      # Historique commandes
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Détail commande
│   │   │   │   └── paiements/
│   │   │   │       └── page.tsx      # Moyens de paiement
│   │   │   └── commande/
│   │   │       ├── panier/
│   │   │       │   └── page.tsx      # Récap panier
│   │   │       ├── livraison/
│   │   │       │   └── page.tsx      # Adresse livraison
│   │   │       ├── paiement/
│   │   │       │   └── page.tsx      # Paiement
│   │   │       └── confirmation/
│   │   │           └── page.tsx      # Confirmation commande
│   │   ├── (admin)/                  # Back-office admin
│   │   │   ├── layout.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx          # Dashboard
│   │   │       ├── livres/
│   │   │       │   ├── page.tsx      # Liste livres
│   │   │       │   ├── nouveau/
│   │   │       │   │   └── page.tsx  # Créer livre
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx  # Éditer livre
│   │   │       ├── auteurs/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── nouveau/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── blog/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── nouveau/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── evenements/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── nouveau/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── commandes/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       └── parametres/
│   │   │           └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts
│   │   │   │   └── signout/
│   │   │   │       └── route.ts
│   │   │   ├── books/
│   │   │   │   ├── route.ts          # GET /api/books
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET/PUT/DELETE
│   │   │   ├── authors/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── cart/
│   │   │   │   └── route.ts          # POST/PUT/DELETE
│   │   │   ├── orders/
│   │   │   │   ├── route.ts          # GET/POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── newsletter/
│   │   │   │   └── subscribe/
│   │   │   │       └── route.ts
│   │   │   ├── contact/
│   │   │   │   └── route.ts
│   │   │   ├── stripe/
│   │   │   │   ├── create-payment-intent/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── cart-drawer.tsx       # Panier latéral
│   │   │   └── mobile-menu.tsx
│   │   ├── books/
│   │   │   ├── book-card.tsx         # Carte livre (grille)
│   │   │   ├── book-grid.tsx         # Grille de livres
│   │   │   ├── book-filters.tsx      # Filtres catalogue
│   │   │   ├── book-detail.tsx       # Détails produit
│   │   │   └── book-recommendations.tsx
│   │   ├── authors/
│   │   │   ├── author-card.tsx
│   │   │   ├── author-modal.tsx      # Pop-up détails auteur
│   │   │   └── author-social.tsx     # Liens réseaux sociaux
│   │   ├── home/
│   │   │   ├── latest-book.tsx       # Bloc dernière sortie
│   │   │   ├── recent-books.tsx      # Bloc 4 livres récents
│   │   │   └── events-calendar.tsx   # Agenda événements
│   │   ├── blog/
│   │   │   ├── blog-card.tsx
│   │   │   ├── blog-grid.tsx
│   │   │   └── blog-content.tsx
│   │   ├── checkout/
│   │   │   ├── cart-summary.tsx
│   │   │   ├── address-form.tsx
│   │   │   ├── payment-form.tsx
│   │   │   └── order-confirmation.tsx
│   │   ├── account/
│   │   │   ├── profile-form.tsx
│   │   │   ├── order-history.tsx
│   │   │   └── payment-methods.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-card.tsx
│   │   │   │   ├── gauge-chart.tsx
│   │   │   │   └── recent-orders.tsx
│   │   │   ├── books/
│   │   │   │   ├── book-form.tsx
│   │   │   │   ├── book-table.tsx
│   │   │   │   └── media-relay-form.tsx
│   │   │   ├── blog/
│   │   │   │   ├── post-editor.tsx   # Éditeur riche
│   │   │   │   └── post-table.tsx
│   │   │   └── sidebar.tsx           # Menu admin
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   ├── social-login.tsx      # Google/Facebook
│   │   │   └── reset-password-form.tsx
│   │   ├── ui/                       # Composants UI de base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── ...
│   │   └── newsletter-popup.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Client Supabase
│   │   ├── supabase-server.ts        # Server-side Supabase
│   │   ├── utils.ts                  # Utilitaires (cn, etc.)
│   │   ├── validations.ts            # Schémas Zod
│   │   ├── stripe.ts                 # Config Stripe
│   │   ├── email.ts                  # Service emailing
│   │   ├── analytics.ts              # Tracking analytics
│   │   └── constants.ts              # Constantes
│   │
│   ├── hooks/
│   │   ├── use-cart.ts               # Hook panier
│   │   ├── use-auth.ts               # Hook auth
│   │   ├── use-books.ts              # Hook livres
│   │   ├── use-authors.ts
│   │   ├── use-toast.ts
│   │   └── use-media-query.ts        # Responsive
│   │
│   ├── store/
│   │   ├── cart.ts                   # Store Zustand panier
│   │   ├── auth.ts                   # Store auth
│   │   └── ui.ts                     # Store UI (modals, etc.)
│   │
│   ├── types/
│   │   ├── index.ts                  # Types principaux
│   │   ├── database.ts               # Types générés Supabase
│   │   └── api.ts                    # Types API
│   │
│   └── middleware.ts                 # Middleware Next.js (auth)
│
├── public/
│   ├── logo-faces-cachees.png
│   ├── images/
│   │   ├── books/                    # Couvertures livres
│   │   ├── authors/                  # Photos auteurs
│   │   └── blog/                     # Images blog
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json
│
├── supabase/
│   ├── migrations/                   # Migrations SQL
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_tables.sql
│   │   ├── 003_books_authors.sql
│   │   ├── 004_orders_cart.sql
│   │   ├── 005_blog_events.sql
│   │   └── ...
│   ├── seed.sql                      # Données de test
│   └── config.toml
│
├── docs/
│   ├── architecture.md               # Ce document
│   ├── database.md                   # Schémas BDD
│   ├── admin-guide.md                # Guide admin
│   └── api.md                        # Documentation API
│
├── scripts/
│   ├── send-cart-reminders.ts        # CRON panier abandonné
│   ├── generate-sitemap.ts           # Génération sitemap
│   └── import-books.ts               # Import données
│
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Principes d'architecture

### 1. App Router Next.js 13+
- Utilisation du nouveau App Router avec layouts partagés
- Server Components par défaut pour les performances
- Client Components uniquement où nécessaire (interactivité)

### 2. Groupes de routes
- `(public)` : Pages accessibles sans authentification
- `(auth)` : Pages d'authentification
- `(protected)` : Pages nécessitant connexion
- `(admin)` : Back-office administration

### 3. Séparation des responsabilités
- **Components** : Composants réutilisables organisés par domaine
- **Lib** : Services et utilitaires
- **Hooks** : Logique réutilisable côté client
- **Store** : Gestion d'état global (Zustand)
- **Types** : Typage TypeScript centralisé

### 4. API Routes
- RESTful API avec Next.js API Routes
- Organisation par ressource (books, authors, orders, etc.)
- Authentification via Supabase
- Validation avec Zod

### 5. Base de données
- Supabase (PostgreSQL)
- Migrations versionnées dans `/supabase/migrations`
- Row Level Security (RLS) pour la sécurité
- Relations optimisées avec indexes

### 6. Authentification
- Supabase Auth (email + Google + Facebook)
- Middleware Next.js pour protéger les routes
- Session management avec cookies sécurisés

### 7. Paiements
- Stripe pour les transactions
- Webhook pour synchronisation
- Gestion sécurisée des tokens

### 8. Performance
- Image optimization avec Next.js Image
- Lazy loading des composants lourds
- Cache des données statiques
- ISR (Incremental Static Regeneration) pour le catalogue

### 9. SEO
- Metadata API de Next.js 13+
- Génération automatique de sitemap
- Structured data (Schema.org)
- Open Graph tags

## Stack technique

### Frontend
- **Framework** : Next.js 16+ (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS v4
- **UI Components** : Radix UI + custom components
- **State Management** : Zustand
- **Form Management** : React Hook Form + Zod
- **Icons** : Lucide React

### Backend
- **Database** : Supabase (PostgreSQL)
- **Authentication** : Supabase Auth
- **Storage** : Supabase Storage (images)
- **API** : Next.js API Routes
- **Payments** : Stripe
- **Email** : Service SMTP (à configurer)

### DevOps
- **Hosting** : Vercel (recommandé)
- **Version Control** : GitHub (repo privé)
- **CI/CD** : GitHub Actions + Vercel
- **Monitoring** : Vercel Analytics

## Flux utilisateur principaux

### 1. Navigation visiteur
```
Accueil → Catalogue → Produit → Panier → Inscription/Connexion → Commande → Confirmation
```

### 2. Gestion compte client
```
Connexion → Compte → [Profil | Commandes | Paiements]
```

### 3. Administration
```
Admin Login → Dashboard → [Livres | Auteurs | Blog | Événements | Commandes]
```

## Sécurité

1. **Authentication** : Supabase Auth avec JWT
2. **Authorization** : RLS Supabase + middleware Next.js
3. **Validation** : Zod pour toutes les entrées
4. **XSS** : Sanitization des entrées utilisateur
5. **CSRF** : Tokens CSRF pour les formulaires sensibles
6. **Secrets** : Variables d'environnement pour toutes les clés
7. **HTTPS** : Obligatoire en production
8. **Rate Limiting** : Protection API avec Vercel

## Performance targets

- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3.5s
- **Lighthouse Score** : > 90
- **Image optimization** : WebP/AVIF avec lazy loading
- **Code splitting** : Automatique via Next.js
- **Bundle size** : Monitored et optimisé

## Accessibilité

- **WCAG 2.1 Level AA** compliance
- Navigation clavier complète
- ARIA labels appropriés
- Contraste des couleurs suffisant
- Support lecteurs d'écran
