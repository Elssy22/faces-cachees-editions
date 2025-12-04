# Faces Cachées Éditions - Site E-commerce

Site e-commerce officiel de la maison d'édition Faces Cachées, développé avec Next.js, TypeScript et Supabase.

## 🚀 Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, Facebook)
- **Payment**: Stripe
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI + custom components
- **Deployment**: Vercel (recommandé)

## 📋 Prérequis

- Node.js 18+ et npm/yarn/pnpm
- Un compte Supabase
- Un compte Stripe (mode test pour le développement)
- (Optionnel) Comptes OAuth Google et Facebook

## 🛠️ Installation

### 1. Cloner le repository

```bash
git clone git@github.com:VOTRE_USERNAME/faces-cachees-editions.git
cd faces-cachees-editions
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration Supabase

#### a. Créer un projet Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Créez un nouveau projet
3. Attendez que le projet soit provisionné (~2 minutes)

#### b. Appliquer les migrations

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet local au projet Supabase
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push

# Charger les données de seed (optionnel, pour dev)
psql -h db.PROJECT-REF.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

#### c. Configurer l'authentification OAuth (optionnel)

**Google OAuth:**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URI de redirection :
   - `https://votre-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (dev)
6. Copiez le Client ID et Client Secret

**Facebook OAuth:**
1. Allez sur [Facebook Developers](https://developers.facebook.com/apps/)
2. Créez une nouvelle app
3. Ajoutez le produit "Facebook Login"
4. Configurez les URI de redirection OAuth
5. Copiez l'App ID et App Secret

Dans Supabase Dashboard → Authentication → Providers, activez et configurez Google et Facebook avec vos clés.

### 4. Configuration Stripe

1. Créez un compte sur [https://stripe.com](https://stripe.com)
2. Allez dans Dashboard → Developers → API keys
3. Copiez vos clés de test (pk_test_... et sk_test_...)
4. Pour le webhook :
   ```bash
   # Installer Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Se connecter
   stripe login

   # Écouter les webhooks en local
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 5. Variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` et remplissez les valeurs :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos vraies valeurs :

```env
# Supabase (depuis https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
FACEBOOK_CLIENT_ID=votre_facebook_app_id
FACEBOOK_CLIENT_SECRET=votre_facebook_app_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (configurez votre provider SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=votre_api_key
FROM_EMAIL=noreply@faces-cachees.fr

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@faces-cachees.fr
```

### 6. Lancer le serveur de développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
faces-cachees-editions/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (public)/           # Routes publiques
│   │   ├── (auth)/             # Routes d'authentification
│   │   ├── (protected)/        # Routes client (authentifié)
│   │   ├── (admin)/            # Back-office admin
│   │   └── api/                # API Routes
│   ├── components/             # Composants React
│   │   ├── layout/             # Header, Footer, etc.
│   │   ├── books/              # Composants livres
│   │   ├── auth/               # Composants auth
│   │   ├── admin/              # Composants admin
│   │   └── ui/                 # Composants UI de base
│   ├── lib/                    # Services et utilitaires
│   ├── hooks/                  # Hooks React custom
│   ├── store/                  # Stores Zustand
│   └── types/                  # Types TypeScript
├── supabase/
│   ├── migrations/             # Migrations SQL
│   ├── seed.sql                # Données de seed
│   └── config.toml             # Config Supabase
├── public/                     # Fichiers statiques
└── docs/                       # Documentation

```

Voir [docs/architecture.md](docs/architecture.md) pour plus de détails.

## 🗄️ Base de données

Le schéma de base de données complet est documenté dans [docs/database.md](docs/database.md).

### Tables principales :

- `profiles` - Profils utilisateurs
- `authors` - Auteurs de la maison
- `books` - Catalogue de livres
- `orders` - Commandes
- `carts` - Paniers
- `blog_posts` - Articles de blog
- `events` - Événements
- `newsletter_subscriptions` - Abonnés newsletter

### Générer les types TypeScript depuis Supabase

```bash
supabase gen types typescript --local > src/types/database.ts
```

## 👤 Accès Admin

Pour créer un utilisateur admin :

1. Inscrivez-vous normalement sur le site
2. Dans Supabase Dashboard → Table Editor → profiles
3. Trouvez votre profil et changez le champ `role` de `'client'` à `'admin'`
4. Accédez au back-office sur `/admin`

## 🧪 Scripts utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm run start

# Linter
npm run lint

# Type checking
npx tsc --noEmit

# Générer types Supabase
supabase gen types typescript --local > src/types/database.ts

# Reset DB locale
supabase db reset

# Créer une migration
supabase migration new nom_de_la_migration
```

## 📧 Configuration Email

Le projet supporte plusieurs providers SMTP. Exemples :

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=votre_sendgrid_api_key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=votre_mailgun_smtp_user
SMTP_PASSWORD=votre_mailgun_smtp_password
```

### AWS SES
```env
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre_aws_access_key
SMTP_PASSWORD=votre_aws_secret_key
```

## 🚀 Déploiement

### Vercel (recommandé)

1. Pushez votre code sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Importez votre repository
4. Configurez les variables d'environnement (même que .env.local)
5. Déployez !

Variables d'environnement importantes à configurer :
- Toutes les variables de `.env.example`
- `NEXT_PUBLIC_SITE_URL` → votre domaine de production

### Configuration post-déploiement

1. **Webhook Stripe** : Configurez l'URL webhook dans Stripe Dashboard vers `https://votre-domaine.com/api/stripe/webhook`

2. **Redirections OAuth** : Ajoutez votre domaine de production dans les configurations Google/Facebook OAuth

3. **CRON Jobs** : Configurez Vercel Cron ou utilisez un service externe pour :
   - Auto-publication des livres programmés
   - Envoi des emails de panier abandonné
   - Mise à jour des analytics quotidiennes

## 📚 Documentation

- [Architecture du projet](docs/architecture.md)
- [Schéma de base de données](docs/database.md)
- [Guide admin](docs/admin-guide.md) (à venir)
- [Documentation API](docs/api.md) (à venir)

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables Supabase
- Variables d'environnement pour toutes les clés sensibles
- Validation des entrées avec Zod
- Protection CSRF sur les formulaires critiques
- Paiements via Stripe (PCI-compliant)
- HTTPS obligatoire en production

## 🤝 Contribution

Ce projet est privé. Pour toute question, contactez l'équipe de développement.

## 📝 License

Propriété de Faces Cachées Éditions. Tous droits réservés.

## 🐛 Bugs & Support

Pour signaler un bug ou demander de l'aide, ouvrez une issue sur le repository GitHub.

---

**Développé avec ❤️ pour Faces Cachées Éditions**
