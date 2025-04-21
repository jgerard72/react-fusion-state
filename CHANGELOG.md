# Changelog

Tous les changements notables apportés à React Fusion State seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2023-11-26

### Ajouts
- Première version publique de React Fusion State
- Hook `useFusionState` pour la gestion d'état global
- Composant `FusionStateProvider` avec support pour l'état initial
- Persistance automatique des données avec détection de la plateforme (localStorage/AsyncStorage)
- Système de persistance flexible et configurable :
  - Persistance simple avec `persistence={true}`
  - Persistance sélective avec `persistence={['user', 'theme']}`
  - Configuration avancée avec options d'adaptateur personnalisé
- Support complet pour React et React Native
- Détection automatique de la plateforme (Web/Native)
- Option de débogage pour le développement
- API simple et familière, similaire à useState

### Corrections
- Correction d'un problème où `persistenceConfig` pouvait être undefined lors de l'utilisation du callback de sauvegarde personnalisé
- Optimisation des performances pour réduire les rendus inutiles
- Corrections de bugs liés aux références et aux changements d'état

### Sécurité
- Vérification stricte des types pour éviter les erreurs de typage
- Prévention des fuites mémoire avec useRef et useCallback

## [Unreleased]

### À venir
- Hook `useFusionStateLog` pour faciliter le débogage
- Hooks spécialisés (`useToggle`, `useCounter`, etc.)
- Support pour l'optimisation de React avec `useDeferredValue` et `useTransition`
- Amélioration de la persistance pour les grandes applications
- Documentation API complète 