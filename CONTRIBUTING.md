# Guide de Contribution

Merci de votre intérêt pour contribuer au projet Faces Cachées Éditions !

## 🔧 Configuration de l'environnement

1. Suivez les instructions du [README.md](README.md) pour configurer votre environnement local
2. Créez une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. Faites vos modifications
4. Testez localement
5. Commitez avec des messages clairs
6. Poussez votre branche et créez une Pull Request

## 📝 Conventions de code

### Commits

Suivez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajouter la page de détail auteur
fix: corriger le calcul du total du panier
docs: mettre à jour le README
style: formatter le code avec Prettier
refactor: restructurer les composants UI
test: ajouter tests pour le panier
chore: mettre à jour les dépendances
```

### Code

- **TypeScript** : Toujours typer vos variables et fonctions
- **Composants** : Un composant par fichier
- **Nommage** :
  - Composants : PascalCase (`BookCard.tsx`)
  - Fonctions : camelCase (`calculateTotal()`)
  - Constantes : UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Imports** : Utilisez les alias de chemin (`@/components/...`)

### Style

- Utilisez Prettier pour le formatage (configuré dans `.prettierrc`)
- Tailwind CSS pour le styling
- Composants UI de `@/components/ui` quand possible

## 🧪 Tests

Avant de soumettre une PR :

```bash
# Vérifier les types
npx tsc --noEmit

# Linter
npm run lint

# Build
npm run build
```

## 🔒 Sécurité

- Ne commitez **JAMAIS** de secrets ou clés API
- Utilisez les variables d'environnement
- Validez toutes les entrées utilisateur
- Suivez les principes de sécurité Supabase RLS

## 📋 Checklist PR

- [ ] Le code build sans erreur
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Code formaté avec Prettier
- [ ] Tests passent (si applicables)
- [ ] Documentation mise à jour si nécessaire
- [ ] Captures d'écran incluses pour les changements UI

## 🤝 Code Review

Toutes les Pull Requests doivent être reviewées avant merge. Soyez patient et ouvert aux suggestions !

## ❓ Questions

Pour toute question, ouvrez une issue ou contactez l'équipe de développement.
