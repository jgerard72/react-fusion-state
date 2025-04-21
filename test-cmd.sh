#!/bin/bash

# Script pour exécuter les tests de React Fusion State

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====== Test de React Fusion State ======${NC}"

# Étape 1: Vérifier que tout est à jour
echo -e "${YELLOW}Étape 1: Installation des dépendances...${NC}"
npm install

# Étape 2: Linting
echo -e "${YELLOW}Étape 2: Vérification du code avec ESLint...${NC}"
npm run lint

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Le linting a échoué. Veuillez corriger les erreurs et réessayer.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Linting réussi!${NC}"
fi

# Étape 3: Tests unitaires
echo -e "${YELLOW}Étape 3: Exécution des tests unitaires...${NC}"
npm test

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Les tests ont échoué. Veuillez corriger les erreurs et réessayer.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Tests réussis!${NC}"
fi

# Étape 4: Vérification de la couverture des tests
echo -e "${YELLOW}Étape 4: Vérification de la couverture de code...${NC}"
npm run test:coverage

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ La couverture de code est insuffisante.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Couverture de code suffisante!${NC}"
fi

# Étape 5: Build
echo -e "${YELLOW}Étape 5: Construction de la bibliothèque...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ La construction a échoué.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Construction réussie!${NC}"
fi

echo -e "${GREEN}====== Tous les tests ont réussi! ======${NC}"
echo -e "Vous pouvez maintenant utiliser la bibliothèque en toute confiance." 