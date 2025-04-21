# Contribuer à React Fusion State

Merci de votre intérêt pour contribuer à React Fusion State ! Ce document fournit des directives pour contribuer efficacement au projet.

## Code de conduite

En participant à ce projet, vous vous engagez à maintenir un environnement respectueux et collaboratif.

## Comment contribuer

### Signaler des bugs

Si vous trouvez un bug dans la bibliothèque :

1. Vérifiez si le problème a déjà été signalé dans les [issues GitHub](https://github.com/jgerard72/react-fusion-state/issues)
2. Si ce n'est pas le cas, créez une nouvelle issue avec un titre clair et une description détaillée
3. Incluez les étapes pour reproduire le problème, l'environnement (navigateur, version de React, etc.) et si possible un exemple minimal

### Suggérer des améliorations

Les suggestions d'améliorations sont les bienvenues :

1. Ouvrez une issue en utilisant le préfixe "[Suggestion]" dans le titre
2. Décrivez clairement la fonctionnalité proposée et son cas d'utilisation
3. Expliquez pourquoi cette fonctionnalité serait bénéfique pour les utilisateurs de la bibliothèque

### Pull Requests

Pour soumettre des modifications de code :

1. Créez une branche à partir de `develop` pour vos modifications
2. Assurez-vous que votre code respecte les conventions de codage du projet
3. Incluez des tests pour les nouvelles fonctionnalités ou les corrections de bugs
4. Vérifiez que tous les tests passent avec `npm test`
5. Mettez à jour la documentation si nécessaire
6. Créez une pull request vers la branche `develop`

## Guide de développement

### Installation du projet

```bash
# Cloner le dépôt
git clone https://github.com/jgerard72/react-fusion-state.git
cd react-fusion-state

# Installer les dépendances
npm install

# Lancer les tests
npm test
```

### Structure du projet

- `/src` - Code source principal
- `/dist` - Build de la bibliothèque (généré automatiquement)
- `/src/__tests__` - Tests unitaires
- `/src/examples` - Exemples d'utilisation

### Normes de codage

- Utilisez TypeScript pour tout le code
- Suivez les règles ESLint et Prettier configurées dans le projet
- Documentez toutes les fonctions et interfaces publiques avec JSDoc
- Maintenez une couverture de tests élevée

### Process de versionnement

Le projet suit [Semantic Versioning](https://semver.org/) :

- `MAJOR.MINOR.PATCH`
- Incrémentation MAJOR pour les changements incompatibles
- Incrémentation MINOR pour les ajouts compatibles
- Incrémentation PATCH pour les corrections de bugs compatibles

### Release checklist

Avant de proposer un changement pour une release :

- [ ] Tous les tests passent
- [ ] La documentation est à jour
- [ ] Le CHANGELOG.md est mis à jour
- [ ] Le code a été vérifié avec ESLint et Prettier
- [ ] Les exemples fonctionnent correctement

## Obtenir de l'aide

Si vous avez des questions sur le processus de contribution, n'hésitez pas à :

- Ouvrir une issue avec votre question
- Contacter le mainteneur via GitHub

Merci pour votre contribution à React Fusion State ! 