# Guide de Démarrage Rapide

## Installation (première utilisation)

Les dépendances sont déjà installées. Si vous devez les réinstaller :

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Démarrage de l'application

### Option 1 : Démarrage manuel (2 terminaux)

**Terminal 1 - Backend :**
```bash
cd backend
npm start
```
Le serveur démarre sur `http://localhost:5000`

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:3000`

### Option 2 : Démarrage avec un script

**Windows (PowerShell) :**
```powershell
# Créez un fichier start.ps1
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c cd backend && npm start"
Start-Sleep -Seconds 3
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c cd frontend && npm run dev"
```

**Linux/Mac (bash) :**
```bash
# Créez un fichier start.sh
cd backend && npm start &
sleep 3
cd ../frontend && npm run dev
```

## Données de test

L'application contient déjà des clients de test :

### Clients Particuliers
- Jean Dupont (PART001)
- Marie Martin (PART002)
- Pierre Bernard (PART003)

### Clients Professionnels
- TechCorp SA (PRO001) - CA: 15M€ → Tarifs Premium
- Startup Innovante SARL (PRO002) - CA: 5M€ → Tarifs Intermédiaires
- Grande Entreprise SAS (PRO003) - CA: 50M€ → Tarifs Premium

## Test rapide

1. Ouvrez `http://localhost:3000`
2. Sélectionnez un client dans la liste déroulante
3. Ajoutez des produits au panier
4. Cliquez sur "Calculer le montant"
5. Observez la différence de prix selon le type de client

## Exemple de calcul

**Pour un particulier (Jean Dupont) :**
- 2 Téléphones Haut de Gamme = 2 × 1 500 € = 3 000 €
- 1 Ordinateur Portable = 1 × 1 200 € = 1 200 €
- **Total = 4 200 €**

**Pour un professionnel CA > 10M€ (TechCorp SA) :**
- 2 Téléphones Haut de Gamme = 2 × 1 000 € = 2 000 €
- 1 Ordinateur Portable = 1 × 900 € = 900 €
- **Total = 2 900 €** (économie de 1 300 €)

**Pour un professionnel CA < 10M€ (Startup Innovante) :**
- 2 Téléphones Haut de Gamme = 2 × 1 150 € = 2 300 €
- 1 Ordinateur Portable = 1 × 1 000 € = 1 000 €
- **Total = 3 300 €** (économie de 900 €)

## Fonctionnalités

- Sélection de client avec affichage du type et du CA
- Ajout/modification/suppression de produits dans le panier
- Calcul automatique selon le type de client
- Création de nouveaux clients (particuliers ou professionnels)
- Interface minimaliste et sobre
- Design responsive

## Dépannage

**Port déjà utilisé :**
- Backend (5000) : Modifiez le port dans `backend/server.js`
- Frontend (3000) : Modifiez le port dans `frontend/vite.config.js`

**Base de données vide :**
```bash
cd backend
npm run seed
```

**Erreur CORS :**
Vérifiez que le backend tourne bien sur le port 5000 et que le proxy est configuré dans `frontend/vite.config.js`
