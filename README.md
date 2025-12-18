# Gestion des Paniers - Application E-Commerce

Application full-stack de gestion de paniers d'achat avec tarification différenciée selon le type de client.

## 📊 Aperçu

| Aspect | Détails |
|--------|---------|
| **Stack** | React 18 + Express.js + SQLite |
| **Tests** | ✅ 103 tests unitaires (99.31% de couverture) |
| **Backend** | API REST avec routes clients/produits/paniers |
| **Frontend** | Interface moderne avec Ant Design + Tailwind |
| **Tarification** | 3 niveaux de prix selon le type de client |

## Description

Cette application permet de gérer des paniers d'achat pour deux types de clients :
- **Clients particuliers** : tarif standard
- **Clients professionnels** : tarif dégressif basé sur le chiffre d'affaires
  - CA > 10M€ : tarif professionnel haut
  - CA ≤ 10M€ : tarif professionnel bas

## Technologies

### Backend
- **Framework** : Express 4.18
- **Base de données** : SQLite 5.1
- **Middleware** : CORS, Body-parser
- **Dev** : Nodemon

### Frontend
- **Framework** : React 18 avec Vite 5
- **UI Library** : Ant Design 5.11
- **Styling** : TailwindCSS 3.3
- **HTTP Client** : Axios 1.6

### Tests
- **Framework** : Jest 29.7
- **HTTP Testing** : Supertest 6.3
- **Couverture** : 99.31% (103 tests unitaires)

## Tests Unitaires

Le backend inclut une suite complète de **103 tests unitaires** avec une couverture de code de **99.31%**.

### Exécuter les Tests

```bash
cd backend

# Tous les tests
npm test

# Tests en mode watch
npm test:watch

# Tests avec rapport de couverture
npm run test:coverage
```

### Couverture de Code

```
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   99.31 |    98.66 |     100 |   99.28 |
 database.js    |     100 |      100 |     100 |     100 |
 routes/        |    99.2 |    98.59 |     100 |   99.15 |
  baskets.js    |    98.3 |    97.05 |     100 |   98.21 |
  clients.js    |     100 |      100 |     100 |     100 |
  products.js   |     100 |      100 |     100 |     100 |
 utils/         |     100 |      100 |     100 |     100 |
  pricing.js    |     100 |      100 |     100 |     100 |
----------------|---------|----------|---------|---------|
```

### Tests Couverts

- **Database** (21 tests) : Initialisation, structure des tables, contraintes, produits par défaut
- **Pricing** (18 tests) : Calcul des prix selon le type de client et le chiffre d'affaires
- **Routes Clients** (27 tests) : GET, POST particulier/professionnel, validation, erreurs
- **Routes Products** (17 tests) : GET all/by ID, validation, cas limites
- **Routes Baskets** (20 tests) : Calcul, création, récupération, validation

## Installation

### Prérequis
- Node.js (version 16+)
- npm

### Backend

```bash
cd backend
npm install

# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install

# Mode développement
npm run dev

# Build production
npm run build
```

L'application démarre sur `http://localhost:5173` (par défaut avec Vite)

## Démarrage Rapide

1. **Installer les dépendances**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Démarrer le backend**
   ```bash
   cd backend
   npm run dev
   # Optionnel: peupler la DB avec des données de test
   npm run seed
   ```

3. **Démarrer le frontend** (dans un nouveau terminal)
   ```bash
   cd frontend
   npm run dev
   ```

4. **Utiliser l'application**
   - Ouvrir `http://localhost:5173` dans votre navigateur
   - Créer un nouveau client ou sélectionner un client existant
   - Ajouter des produits au panier
   - Calculer le montant total

5. **Exécuter les tests** (optionnel)
   ```bash
   cd backend
   npm test
   ```

## Produits Disponibles

| Code | Produit | Prix Particulier | Prix Pro Haut (>10M€) | Prix Pro Bas (≤10M€) |
|------|---------|-----------------|---------------------|---------------------|
| PHONE_HIGH | Téléphone Haut de Gamme | 1500€ | 1000€ | 1150€ |
| PHONE_MID | Téléphone Milieu de Gamme | 800€ | 550€ | 600€ |
| LAPTOP | Ordinateur Portable | 1200€ | 900€ | 1000€ |

## API Endpoints

### Clients

- `GET /api/clients` - Liste tous les clients (particuliers et professionnels)
- `POST /api/clients/particulier` - Créer un client particulier
- `POST /api/clients/professionnel` - Créer un client professionnel

#### Créer un client particulier
```json
POST /api/clients/particulier
{
  "identifiant": "CLI001",
  "prenom": "Jean",
  "nom": "Dupont"
}
```

#### Créer un client professionnel
```json
POST /api/clients/professionnel
{
  "identifiant": "PRO001",
  "raison_sociale": "Société XYZ",
  "numero_tva": "FR12345678901",
  "numero_immatriculation": "123456789",
  "chiffre_affaires": 15000000
}
```

### Produits

- `GET /api/products` - Liste tous les produits

### Paniers

- `GET /api/baskets` - Liste tous les paniers
- `POST /api/baskets` - Créer et sauvegarder un panier
- `POST /api/baskets/calculer` - Calculer le montant d'un panier

#### Calculer un panier
```json
POST /api/baskets/calculer
{
  "clientType": "professionnel",
  "clientId": 1,
  "items": [
    { "produitId": 1, "quantite": 2 },
    { "produitId": 3, "quantite": 1 }
  ]
}
```

#### Réponse
```json
{
  "client": {
    "type": "professionnel",
    "nom": "Société XYZ"
  },
  "details": [
    {
      "produit": "Téléphone Haut de Gamme",
      "quantite": 2,
      "prixUnitaire": 1000,
      "sousTotal": 2000
    },
    {
      "produit": "Ordinateur Portable",
      "quantite": 1,
      "prixUnitaire": 900,
      "sousTotal": 900
    }
  ],
  "total": 2900
}
```

## Structure du Projet

```
Test-Technique/
├── backend/
│   ├── database.js          # Configuration SQLite et initialisation des tables
│   ├── server.js            # Point d'entrée du serveur Express
│   ├── seed.js              # Script pour peupler la DB avec des données de test
│   ├── panier.db            # Base de données SQLite (générée automatiquement)
│   ├── package.json
│   ├── jest.config.js       # Configuration Jest
│   ├── jest.setup.js        # Setup des tests
│   ├── routes/
│   │   ├── clients.js       # Routes de gestion des clients
│   │   ├── products.js      # Routes de gestion des produits
│   │   └── baskets.js       # Routes de gestion des paniers et calculs
│   ├── utils/
│   │   └── pricing.js       # Logique de calcul des prix
│   ├── test-utils/
│   │   └── db-mock.js       # Utilitaires pour mocker la DB dans les tests
│   └── __tests__/
│       └── unit/
│           ├── database.test.js
│           ├── pricing.test.js
│           └── routes/
│               ├── clients.test.js
│               ├── products.test.js
│               └── baskets.test.js
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Composant principal de l'application
    │   ├── main.jsx         # Point d'entrée React
    │   ├── index.css        # Styles globaux avec Tailwind
    │   └── services/
    │       ├── api.js           # Configuration Axios
    │       ├── client.service.js
    │       ├── product.service.js
    │       └── basket.service.js
    ├── index.html
    ├── package.json
    ├── vite.config.js       # Configuration Vite (proxy API)
    ├── tailwind.config.js
    └── postcss.config.js
```

## Base de Données

### Tables SQLite

#### clients_particuliers
```sql
- id INTEGER PRIMARY KEY
- identifiant TEXT UNIQUE
- prenom TEXT
- nom TEXT
- created_at DATETIME
```

#### clients_professionnels
```sql
- id INTEGER PRIMARY KEY
- identifiant TEXT UNIQUE
- raison_sociale TEXT
- numero_tva TEXT
- numero_immatriculation TEXT
- chiffre_affaires REAL
- created_at DATETIME
```

#### produits
```sql
- id INTEGER PRIMARY KEY
- code TEXT UNIQUE
- nom TEXT
- prix_particulier REAL
- prix_pro_haut REAL
- prix_pro_bas REAL
```

#### paniers
```sql
- id INTEGER PRIMARY KEY
- client_type TEXT
- client_id INTEGER
- created_at DATETIME
```

#### panier_items
```sql
- id INTEGER PRIMARY KEY
- panier_id INTEGER (FK)
- produit_id INTEGER (FK)
- quantite INTEGER
```

## Fonctionnalités

### Interface Utilisateur

1. **Gestion des clients**
   - Visualisation de tous les clients dans une liste déroulante
   - Création de nouveaux clients (particuliers ou professionnels)
   - Formulaire modal avec validation

2. **Gestion du panier**
   - Ajout de produits au panier
   - Modification des quantités via InputNumber
   - Suppression automatique si quantité = 0
   - Interface réactive avec cards pour chaque produit

3. **Calcul et affichage**
   - Calcul automatique du total selon le type de client
   - Tableau récapitulatif avec détails des articles
   - Affichage des prix unitaires et sous-totaux
   - Total mis en évidence

4. **Design**
   - Interface moderne avec Ant Design
   - Responsive design avec Tailwind
   - Feedback utilisateur avec messages de succès/erreur

### Proxy Vite
Le frontend proxy les requêtes `/api` vers `http://localhost:5000` (voir `frontend/vite.config.js:7`).

## Qualité du Code

✅ **103 tests unitaires** passants
✅ **99.31%** de couverture de code
✅ **100%** de couverture sur les modules critiques (database, pricing, routes clients/produits)
✅ Tests des cas nominaux, validations et erreurs
✅ Mocks de la base de données pour l'isolation des tests
✅ Architecture modulaire et séparation des responsabilités

## Scripts Disponibles

### Backend
```bash
npm start            # Démarre le serveur en mode production
npm run dev          # Démarre avec nodemon (rechargement auto)
npm run seed         # Peuple la DB avec des données de test
npm test             # Exécute tous les tests unitaires
npm run test:watch   # Tests en mode watch
npm run test:coverage # Génère le rapport de couverture
```

### Frontend
```bash
npm run dev      # Serveur de développement Vite
npm run build    # Build de production
npm run preview  # Prévisualise le build
```
