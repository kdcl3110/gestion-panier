const express = require('express');
const request = require('supertest');
const { mockDbAll, mockDbGet, mockDbRun } = require('../../../test-utils/db-mock');

// Mock du module database
jest.mock('../../../database', () => {
  const mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    serialize: jest.fn((callback) => callback()),
  };
  return {
    db: mockDb,
    initDatabase: jest.fn(),
  };
});

// Mock du module pricing
jest.mock('../../../utils/pricing', () => ({
  calculerPrixProduit: jest.fn(),
}));

const { db } = require('../../../database');
const { calculerPrixProduit } = require('../../../utils/pricing');
const basketsRouter = require('../../../routes/baskets');

// Créer une app Express de test
const app = express();
app.use(express.json());
app.use('/api/baskets', basketsRouter);

describe('Routes Baskets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /calculer', () => {
    it('doit calculer le total d\'un panier pour un client particulier', async () => {
      const requestBody = {
        clientType: 'particulier',
        clientId: 1,
        items: [
          { produitId: 1, quantite: 2 },
          { produitId: 2, quantite: 1 },
        ],
      };

      const client = {
        id: 1,
        identifiant: 'PART001',
        prenom: 'Jean',
        nom: 'Dupont',
      };

      const produits = [
        {
          id: 1,
          code: 'PHONE_HIGH',
          nom: 'Téléphone Haut de Gamme',
          prix_particulier: 1500,
          prix_pro_haut: 1000,
          prix_pro_bas: 1150,
        },
        {
          id: 2,
          code: 'LAPTOP',
          nom: 'Ordinateur Portable',
          prix_particulier: 1200,
          prix_pro_haut: 900,
          prix_pro_bas: 1000,
        },
      ];

      // Mock db.get pour récupérer le client
      mockDbGet(db, null, client);

      // Mock db.all pour récupérer les produits
      mockDbAll(db, null, produits);

      // Mock calculerPrixProduit
      calculerPrixProduit
        .mockReturnValueOnce(1500) // Pour produit 1
        .mockReturnValueOnce(1200); // Pour produit 2

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('client');
      expect(response.body.client.nom).toBe('Jean Dupont');
      expect(response.body.client.type).toBe('particulier');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 4200); // (1500 * 2) + (1200 * 1)

      expect(calculerPrixProduit).toHaveBeenCalledTimes(2);
      expect(calculerPrixProduit).toHaveBeenCalledWith(produits[0], 'particulier', 0);
      expect(calculerPrixProduit).toHaveBeenCalledWith(produits[1], 'particulier', 0);
    });

    it('doit calculer le total d\'un panier pour un client professionnel', async () => {
      const requestBody = {
        clientType: 'professionnel',
        clientId: 5,
        items: [
          { produitId: 1, quantite: 3 },
        ],
      };

      const client = {
        id: 5,
        identifiant: 'PRO005',
        raison_sociale: 'Tech Corp',
        numero_tva: 'FR123',
        numero_immatriculation: 'RCS123',
        chiffre_affaires: 15000000,
      };

      const produits = [
        {
          id: 1,
          code: 'PHONE_HIGH',
          nom: 'Téléphone Haut de Gamme',
          prix_particulier: 1500,
          prix_pro_haut: 1000,
          prix_pro_bas: 1150,
        },
      ];

      mockDbGet(db, null, client);
      mockDbAll(db, null, produits);
      calculerPrixProduit.mockReturnValue(1000); // Prix pro haut

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.client.nom).toBe('Tech Corp');
      expect(response.body.client.type).toBe('professionnel');
      expect(response.body.total).toBe(3000); // 1000 * 3

      expect(calculerPrixProduit).toHaveBeenCalledWith(
        produits[0],
        'professionnel',
        15000000
      );
    });

    it('doit retourner 400 si clientType manquant', async () => {
      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientId: 1,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 400 si clientId manquant', async () => {
      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 400 si items manquant', async () => {
      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 400 si items est un tableau vide', async () => {
      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 404 si client non trouvé', async () => {
      mockDbGet(db, null, null);

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 999,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Client non trouvé');
    });

    it('doit retourner 500 si erreur DB lors de la récupération du client', async () => {
      mockDbGet(db, new Error('Erreur DB client'));

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur DB client');
    });

    it('doit retourner 500 si erreur DB lors de la récupération des produits', async () => {
      const client = { id: 1, prenom: 'Jean', nom: 'Dupont' };
      mockDbGet(db, null, client);
      mockDbAll(db, new Error('Erreur DB produits'));

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur DB produits');
    });

    it('doit ignorer les produits non trouvés dans le calcul', async () => {
      const client = { id: 1, prenom: 'Jean', nom: 'Dupont' };
      const produits = [
        {
          id: 1,
          nom: 'Produit 1',
          prix_particulier: 100,
          prix_pro_haut: 80,
          prix_pro_bas: 90,
        },
      ];

      mockDbGet(db, null, client);
      mockDbAll(db, null, produits);
      calculerPrixProduit.mockReturnValue(100);

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [
            { produitId: 1, quantite: 2 },
            { produitId: 999, quantite: 5 }, // Produit inexistant
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.details).toHaveLength(1); // Seulement produit 1
      expect(response.body.total).toBe(200); // 100 * 2
    });

    it('doit calculer correctement avec plusieurs produits et quantités', async () => {
      const client = { id: 1, prenom: 'Test', nom: 'User' };
      const produits = [
        { id: 1, nom: 'P1', prix_particulier: 50, prix_pro_haut: 40, prix_pro_bas: 45 },
        { id: 2, nom: 'P2', prix_particulier: 100, prix_pro_haut: 80, prix_pro_bas: 90 },
        { id: 3, nom: 'P3', prix_particulier: 25, prix_pro_haut: 20, prix_pro_bas: 22 },
      ];

      mockDbGet(db, null, client);
      mockDbAll(db, null, produits);
      calculerPrixProduit
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(25);

      const response = await request(app)
        .post('/api/baskets/calculer')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [
            { produitId: 1, quantite: 2 },
            { produitId: 2, quantite: 3 },
            { produitId: 3, quantite: 4 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.details).toHaveLength(3);
      expect(response.body.total).toBe(500); // (50*2) + (100*3) + (25*4) = 100 + 300 + 100
    });
  });

  describe('POST /', () => {
    it('doit créer un panier avec succès', async () => {
      const requestBody = {
        clientType: 'particulier',
        clientId: 1,
        items: [
          { produitId: 1, quantite: 2 },
          { produitId: 2, quantite: 1 },
        ],
      };

      // Mock db.run pour l'insertion du panier
      mockDbRun(db, null, 42);

      const response = await request(app)
        .post('/api/baskets')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 42,
        message: 'Panier créé avec succès',
      });

      // Vérifier que db.run a été appelé pour le panier
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO paniers (client_type, client_id) VALUES (?, ?)',
        ['particulier', 1],
        expect.any(Function)
      );

      // Vérifier que db.run a été appelé pour chaque item (2 fois)
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO panier_items (panier_id, produit_id, quantite) VALUES (?, ?, ?)',
        [42, 1, 2],
        expect.any(Function)
      );

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO panier_items (panier_id, produit_id, quantite) VALUES (?, ?, ?)',
        [42, 2, 1],
        expect.any(Function)
      );
    });

    it('doit retourner 400 si clientType manquant', async () => {
      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientId: 1,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
      expect(db.run).not.toHaveBeenCalled();
    });

    it('doit retourner 400 si clientId manquant', async () => {
      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'particulier',
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 400 si items manquant', async () => {
      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'particulier',
          clientId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 400 si items est vide', async () => {
      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Données invalides');
    });

    it('doit retourner 500 si erreur lors de la création du panier', async () => {
      mockDbRun(db, new Error('Erreur insertion panier'));

      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'particulier',
          clientId: 1,
          items: [{ produitId: 1, quantite: 1 }],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur insertion panier');
    });

    it('doit créer un panier avec un seul item', async () => {
      mockDbRun(db, null, 10);

      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'professionnel',
          clientId: 5,
          items: [{ produitId: 3, quantite: 10 }],
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(10);
    });

    it('doit créer un panier avec plusieurs items', async () => {
      mockDbRun(db, null, 99);

      const response = await request(app)
        .post('/api/baskets')
        .send({
          clientType: 'particulier',
          clientId: 2,
          items: [
            { produitId: 1, quantite: 1 },
            { produitId: 2, quantite: 2 },
            { produitId: 3, quantite: 3 },
            { produitId: 4, quantite: 4 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(99);

      // Vérifier que db.run a été appelé 5 fois : 1 pour panier + 4 pour items
      expect(db.run).toHaveBeenCalledTimes(5);
    });
  });

  describe('GET /', () => {
    it('doit retourner tous les paniers', async () => {
      const paniers = [
        {
          id: 1,
          client_type: 'particulier',
          client_id: 1,
          created_at: '2024-01-01 10:00:00',
          items: '1:2,2:1',
        },
        {
          id: 2,
          client_type: 'professionnel',
          client_id: 5,
          created_at: '2024-01-01 11:00:00',
          items: '3:5',
        },
      ];

      mockDbAll(db, null, paniers);

      const response = await request(app).get('/api/baskets');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(paniers);
      expect(response.body).toHaveLength(2);
    });

    it('doit retourner un tableau vide si aucun panier', async () => {
      mockDbAll(db, null, []);

      const response = await request(app).get('/api/baskets');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('doit retourner 500 si erreur DB', async () => {
      mockDbAll(db, new Error('Erreur récupération paniers'));

      const response = await request(app).get('/api/baskets');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur récupération paniers');
    });

    it('doit vérifier que les paniers sont triés par date décroissante', async () => {
      const paniers = [
        {
          id: 3,
          client_type: 'particulier',
          client_id: 1,
          created_at: '2024-01-03 10:00:00',
          items: '1:1',
        },
        {
          id: 2,
          client_type: 'professionnel',
          client_id: 2,
          created_at: '2024-01-02 10:00:00',
          items: '2:2',
        },
        {
          id: 1,
          client_type: 'particulier',
          client_id: 3,
          created_at: '2024-01-01 10:00:00',
          items: '3:3',
        },
      ];

      mockDbAll(db, null, paniers);

      const response = await request(app).get('/api/baskets');

      expect(response.status).toBe(200);
      expect(response.body[0].id).toBe(3);
      expect(response.body[1].id).toBe(2);
      expect(response.body[2].id).toBe(1);
    });

    it('doit vérifier que la requête SQL utilise GROUP_CONCAT et JOIN', async () => {
      mockDbAll(db, null, []);

      await request(app).get('/api/baskets');

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('GROUP_CONCAT'),
        [],
        expect.any(Function)
      );

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN'),
        [],
        expect.any(Function)
      );

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY p.created_at DESC'),
        [],
        expect.any(Function)
      );
    });
  });
});
