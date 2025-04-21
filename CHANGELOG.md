# Changelog

Tous les changements notables apportés à React Fusion State seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2023-11-30

### Ajouts
- Première version publique de React Fusion State
- Hook `useFusionState` pour la gestion d'état global
- Composant `FusionStateProvider` avec support pour l'état initial
- Persistance automatique des données avec détection de la plateforme
- Support complet pour React et React Native
- Option de débogage pour le développement
- Configuration de persistance flexible (true/false, liste de clés, options avancées)

### Corrections
- Correction d'un problème où `persistenceConfig` pouvait être undefined lors de l'utilisation du callback de sauvegarde personnalisé
- Optimisation des performances pour réduire les rendus inutiles

### Sécurité
- Vérification stricte des types pour éviter les erreurs de typage

## [Unreleased]

### À venir
- Hook `useFusionStateLog` pour faciliter le débogage
- Hooks spécialisés (`useToggle`, `useCounter`, etc.)
- Support pour l'optimisation de React avec `useDeferredValue` et `useTransition`
- Amélioration de la persistance pour les grandes applications
- Documentation API complète 