# Application de Gestion des Paniers

Application complète de gestion de paniers pour clients particuliers et professionnels.

## Architecture

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Ant Design + Tailwind CSS

## Fonctionnalités

- Création et gestion de clients (particuliers et professionnels)
- Gestion de panier avec trois types de produits
- Calcul automatique des prix selon le type de client
- Interface minimaliste et sobre
- Tarification différenciée :
  - Particuliers : prix standard
  - Professionnels (CA > 10M€) : tarifs premium
  - Professionnels (CA < 10M€) : tarifs intermédiaires

## Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:6000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application frontend démarre sur `http://localhost:3000`

## Utilisation

1. Démarrer le backend
2. Démarrer le frontend
3. Ouvrir `http://localhost:3000` dans votre navigateur
4. Créer un client (ou utiliser les clients existants)
5. Sélectionner un client
6. Ajouter des produits au panier
7. Calculer le montant total

## Produits disponibles

1. **Téléphone Haut de Gamme**
   - Particulier : 1 500 €
   - Pro (CA > 10M€) : 1 000 €
   - Pro (CA < 10M€) : 1 150 €

2. **Téléphone Milieu de Gamme**
   - Particulier : 800 €
   - Pro (CA > 10M€) : 550 €
   - Pro (CA < 10M€) : 600 €

3. **Ordinateur Portable**
   - Particulier : 1 200 €
   - Pro (CA > 10M€) : 900 €
   - Pro (CA < 10M€) : 1 000 €

## API Endpoints

### Clients

- `GET /api/clients` - Liste tous les clients
- `POST /api/clients/particulier` - Créer un client particulier
- `POST /api/clients/professionnel` - Créer un client professionnel
- `GET /api/clients/:type/:id` - Récupérer un client spécifique

### Produits

- `GET /api/produits` - Liste tous les produits
- `GET /api/produits/:id` - Récupérer un produit spécifique

### Paniers

- `POST /api/paniers/calculer` - Calculer le montant d'un panier
- `POST /api/paniers` - Créer et sauvegarder un panier
- `GET /api/paniers` - Liste tous les paniers

## Structure du projet

```
Test-Technique/
├── backend/
│   ├── database.js          # Configuration SQLite
│   ├── server.js            # Serveur Express
│   ├── package.json
│   └── routes/
│       ├── clients.js       # Routes clients
│       ├── produits.js      # Routes produits
│       └── paniers.js       # Routes paniers
└── frontend/
    ├── src/
    │   ├── App.jsx          # Composant principal
    │   ├── main.jsx         # Point d'entrée
    │   └── index.css        # Styles globaux
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```
