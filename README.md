# Gestion des Paniers - Application E-Commerce

Application full-stack de gestion de paniers d'achat avec tarification différenciée selon le type de client.

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

1. Démarrer le backend : `cd backend && npm run dev`
2. Dans un nouveau terminal, démarrer le frontend : `cd frontend && npm run dev`
3. Ouvrir `http://localhost:5173` dans votre navigateur
4. Créer un nouveau client ou sélectionner un client existant
5. Ajouter des produits au panier
6. Calculer le montant total

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
│   ├── panier.db           # Base de données SQLite (générée automatiquement)
│   ├── package.json
│   └── routes/
│       ├── clients.js       # Routes de gestion des clients
│       ├── products.js      # Routes de gestion des produits
│       └── baskets.js       # Routes de gestion des paniers et calculs
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

## Scripts Disponibles

### Backend
```bash
npm start      # Démarre le serveur en mode production
npm run dev    # Démarre avec nodemon (rechargement auto)
```

### Frontend
```bash
npm run dev      # Serveur de développement Vite
npm run build    # Build de production
npm run preview  # Prévisualise le build
```
