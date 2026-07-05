# Instructions pour tester React Fusion State

Ce document fournit des instructions détaillées pour tester les modifications apportées à la bibliothèque React Fusion State.

## Méthode simple (recommandée)

Pour tester rapidement et facilement la bibliothèque, utilisez le script de test automatisé :

```bash
# Rendre le script exécutable si nécessaire
chmod +x test-cmd.sh

# Exécuter le script de test
./test-cmd.sh
```

Ce script effectuera toutes les étapes de test nécessaires et vous informera si tout fonctionne correctement.

## Tests automatisés manuels

Si vous préférez exécuter les tests étape par étape :

### 1. Tests unitaires

```bash
# Tests basiques
npm test

# Tests avec watching (pour le développement)
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

### 2. Lint et build

```bash
# Vérifier le code avec ESLint
npm run lint

# Compiler la bibliothèque
npm run build
```

## Test manuel dans un projet React

### Méthode 1: Utilisation du script de test fourni

1. Compiler la bibliothèque:
   ```bash
   npm run build
   ```

2. Créer un nouveau projet React:
   ```bash
   npx create-react-app test-fusion
   cd test-fusion
   ```

3. Copier le fichier `test-script.js` dans `src/App.js` du projet test

4. Installer la bibliothèque locale:
   ```bash
   npm install /chemin/absolu/vers/react-fusion-state
   ```

5. Démarrer l'application:
   ```bash
   npm start
   ```

6. Vérifier que:
   - Le compteur s'incrémente/décrémente correctement
   - Les deux composants (Counter et CounterDisplay) restent synchronisés
   - Le formulaire utilisateur fonctionne correctement
   - Le débogueur d'état affiche les valeurs actuelles
   - La console affiche les logs d'état quand ils changent

### Méthode 2: Installation depuis GitHub

Si vous préférez tester depuis GitHub:

1. Publier vos modifications sur GitHub

2. Dans un projet React, installer depuis GitHub:
   ```bash
   npm install github:jgerard72/react-fusion-state
   ```

3. Créer un composant de test similaire à celui du script de test

## Points à vérifier

- **Gestion d'état basique**: Le hook `useFusionState` initialise et met à jour correctement les valeurs
- **État partagé**: Plusieurs composants utilisant la même clé sont synchronisés
- **Débogage**: Les options de débogage fonctionnent correctement
- **Performance**: L'option `skipLocalState` améliore les performances comme prévu
- **Gestion des erreurs**: Les erreurs sont correctement déclenchées et formatées

## Structure des tests

Les tests unitaires sont organisés comme suit:

- `useFusionState.test.tsx` - Tests pour le hook principal
- `useFusionStateLog.test.tsx` - Tests pour le hook de logging
- `FusionStateProvider.test.tsx` - Tests pour le provider
- `integration.test.tsx` - Tests d'intégration pour tous les composants ensemble

## Dépannage

### Erreur "React Hook useEffect has a missing dependency"

Cette erreur de lint peut apparaître dans certains hooks. C'est généralement sans conséquence, mais peut être corrigée en ajoutant les dépendances manquantes.

### Erreur "Cannot read properties of undefined (reading 'has')"

Si cette erreur se produit, cela indique probablement un problème avec `initializingKeys`. Vérifiez que vous utilisez `initializing.current` au lieu de `initializingKeys` directement dans la fonction `useFusionState`.

### Erreur "Property 'toBeInTheDocument' does not exist"

Assurez-vous que le fichier `setupTests.ts` est correctement configuré et que la dépendance `@testing-library/jest-dom` est installée.

### Erreur "Module not found: Can't resolve 'react-fusion-state'"

Assurez-vous que le chemin vers votre bibliothèque locale est correct lors de l'installation. 