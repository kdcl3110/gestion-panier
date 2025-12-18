const express = require('express');
const request = require('supertest');
const { mockDbAll, mockDbGet } = require('../../../test-utils/db-mock');

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

const { db } = require('../../../database');
const productsRouter = require('../../../routes/products');

// Créer une app Express de test
const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('Routes Products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('doit retourner tous les produits', async () => {
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
          code: 'PHONE_MID',
          nom: 'Téléphone Milieu de Gamme',
          prix_particulier: 800,
          prix_pro_haut: 550,
          prix_pro_bas: 600,
        },
        {
          id: 3,
          code: 'LAPTOP',
          nom: 'Ordinateur Portable',
          prix_particulier: 1200,
          prix_pro_haut: 900,
          prix_pro_bas: 1000,
        },
      ];

      mockDbAll(db, null, produits);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(produits);
      expect(response.body).toHaveLength(3);

      expect(db.all).toHaveBeenCalledWith(
        'SELECT * FROM produits',
        [],
        expect.any(Function)
      );
    });

    it('doit retourner un tableau vide si aucun produit', async () => {
      mockDbAll(db, null, []);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('doit retourner une erreur 500 si erreur DB', async () => {
      mockDbAll(db, new Error('Erreur de connexion DB'));

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur de connexion DB');
    });

    it('doit vérifier que tous les produits ont les champs nécessaires', async () => {
      const produits = [
        {
          id: 1,
          code: 'TEST001',
          nom: 'Produit Test',
          prix_particulier: 100,
          prix_pro_haut: 80,
          prix_pro_bas: 90,
        },
      ];

      mockDbAll(db, null, produits);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0]).toHaveProperty('nom');
      expect(response.body[0]).toHaveProperty('prix_particulier');
      expect(response.body[0]).toHaveProperty('prix_pro_haut');
      expect(response.body[0]).toHaveProperty('prix_pro_bas');
    });
  });

  describe('GET /:id', () => {
    it('doit retourner un produit existant par son ID', async () => {
      const produit = {
        id: 1,
        code: 'PHONE_HIGH',
        nom: 'Téléphone Haut de Gamme',
        prix_particulier: 1500,
        prix_pro_haut: 1000,
        prix_pro_bas: 1150,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(produit);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM produits WHERE id = ?',
        ['1'],
        expect.any(Function)
      );
    });

    it('doit retourner 404 si produit non trouvé', async () => {
      mockDbGet(db, null, null);

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Produit non trouvé');
    });

    it('doit retourner 500 si erreur DB', async () => {
      mockDbGet(db, new Error('Erreur base de données'));

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur base de données');
    });

    it('doit gérer un ID numérique valide', async () => {
      const produit = {
        id: 42,
        code: 'PROD42',
        nom: 'Produit 42',
        prix_particulier: 999,
        prix_pro_haut: 799,
        prix_pro_bas: 849,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/42');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(produit);
    });

    it('doit gérer un ID de type string (converti par Express)', async () => {
      mockDbGet(db, null, null);

      const response = await request(app).get('/api/products/abc');

      // La route accepte n'importe quelle valeur, la DB retournera null
      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM produits WHERE id = ?',
        ['abc'],
        expect.any(Function)
      );
    });

    it('doit vérifier la structure complète du produit retourné', async () => {
      const produit = {
        id: 2,
        code: 'LAPTOP_PRO',
        nom: 'Laptop Professionnel',
        prix_particulier: 2500.99,
        prix_pro_haut: 2000.50,
        prix_pro_bas: 2200.75,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/2');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(2);
      expect(response.body.code).toBe('LAPTOP_PRO');
      expect(response.body.nom).toBe('Laptop Professionnel');
      expect(response.body.prix_particulier).toBe(2500.99);
      expect(response.body.prix_pro_haut).toBe(2000.50);
      expect(response.body.prix_pro_bas).toBe(2200.75);
    });
  });

  describe('Cas limites', () => {
    it('doit gérer correctement des prix à 0', async () => {
      const produit = {
        id: 1,
        code: 'FREE_PRODUCT',
        nom: 'Produit Gratuit',
        prix_particulier: 0,
        prix_pro_haut: 0,
        prix_pro_bas: 0,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.prix_particulier).toBe(0);
      expect(response.body.prix_pro_haut).toBe(0);
      expect(response.body.prix_pro_bas).toBe(0);
    });

    it('doit gérer des noms de produits avec caractères spéciaux', async () => {
      const produit = {
        id: 1,
        code: 'SPECIAL_CHAR',
        nom: 'Produit "Spécial" & Unique - Test\'s',
        prix_particulier: 100,
        prix_pro_haut: 80,
        prix_pro_bas: 90,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.nom).toBe('Produit "Spécial" & Unique - Test\'s');
    });

    it('doit gérer de très grands prix', async () => {
      const produit = {
        id: 1,
        code: 'EXPENSIVE',
        nom: 'Produit Très Cher',
        prix_particulier: 999999999.99,
        prix_pro_haut: 888888888.88,
        prix_pro_bas: 900000000.00,
      };

      mockDbGet(db, null, produit);

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.prix_particulier).toBe(999999999.99);
    });
  });
});
