# Backend - API Gestion des Paniers

API REST pour la gestion des paniers clients avec tarification différenciée.

## Structure du Projet

```
backend/
├── routes/              # Routes de l'API
│   ├── clients.js      # Routes pour les clients
│   ├── products.js     # Routes pour les produits
│   └── baskets.js      # Routes pour les paniers
├── utils/              # Utilitaires
│   └── pricing.js      # Logique de calcul des prix
├── test-utils/         # Utilitaires de test
│   └── db-mock.js      # Mocks pour la base de données
├── __tests__/          # Tests
│   └── unit/           # Tests unitaires
│       ├── database.test.js
│       ├── pricing.test.js
│       └── routes/
│           ├── clients.test.js
│           ├── products.test.js
│           └── baskets.test.js
├── database.js         # Configuration et initialisation de la DB
├── server.js           # Point d'entrée de l'application
└── seed.js             # Script pour peupler la DB avec des données de test
```

## Installation

```bash
npm install
```

## Scripts Disponibles

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement (avec nodemon)
npm run dev

# Peupler la base de données avec des données de test
npm run seed

# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm test:watch

# Générer le rapport de couverture
npm run test:coverage
```

## API Endpoints

### Clients

- `GET /api/clients` - Récupérer tous les clients
- `POST /api/clients/particulier` - Créer un client particulier
- `POST /api/clients/professionnel` - Créer un client professionnel
- `GET /api/clients/:type/:id` - Récupérer un client spécifique

### Produits

- `GET /api/products` - Récupérer tous les produits
- `GET /api/products/:id` - Récupérer un produit spécifique

### Paniers

- `POST /api/baskets/calculer` - Calculer le total d'un panier
- `POST /api/baskets` - Créer et sauvegarder un panier
- `GET /api/baskets` - Récupérer tous les paniers

## Règles de Tarification

Le système applique des prix différents selon le type de client :

### Clients Particuliers
- Utilisent le **prix_particulier**

### Clients Professionnels
- **CA ≤ 10M€** : Utilisent le **prix_pro_bas**
- **CA > 10M€** : Utilisent le **prix_pro_haut**

## Tests

Le projet inclut **103 tests unitaires** avec une couverture de code de **99.31%**.

### Couverture des Tests

```
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   99.31 |    98.66 |     100 |   99.28 |
 database.js    |     100 |      100 |     100 |     100 |
 routes/        |    99.2 |    98.59 |     100 |   99.15 |
 utils/         |     100 |      100 |     100 |     100 |
----------------|---------|----------|---------|---------|
```

### Exécuter les Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm test:watch

# Tests avec rapport de couverture
npm run test:coverage
```

## Base de Données

SQLite avec les tables suivantes :
- `clients_particuliers` - Clients individuels
- `clients_professionnels` - Clients professionnels
- `produits` - Catalogue de produits
- `paniers` - Paniers créés
- `panier_items` - Articles dans les paniers

### Produits par Défaut

| Code | Nom | Prix Particulier | Prix Pro Haut | Prix Pro Bas |
|------|-----|------------------|---------------|--------------|
| PHONE_HIGH | Téléphone Haut de Gamme | 1500€ | 1000€ | 1150€ |
| PHONE_MID | Téléphone Milieu de Gamme | 800€ | 550€ | 600€ |
| LAPTOP | Ordinateur Portable | 1200€ | 900€ | 1000€ |

## Technologies

- **Express.js** - Framework web
- **SQLite3** - Base de données
- **Jest** - Framework de test
- **Supertest** - Tests d'API HTTP
- **Nodemon** - Rechargement automatique en développement
