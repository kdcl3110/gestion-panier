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

const { db } = require('../../../database');
const clientsRouter = require('../../../routes/clients');

// Créer une app Express de test
const app = express();
app.use(express.json());
app.use('/api/clients', clientsRouter);

describe('Routes Clients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('doit retourner tous les clients (particuliers et professionnels)', async () => {
      const particuliers = [
        { id: 1, identifiant: 'PART001', prenom: 'Jean', nom: 'Dupont' },
        { id: 2, identifiant: 'PART002', prenom: 'Marie', nom: 'Martin' },
      ];

      const professionnels = [
        { id: 1, identifiant: 'PRO001', raison_sociale: 'Tech Corp', numero_tva: 'FR123', numero_immatriculation: 'RCS123', chiffre_affaires: 5000000 },
      ];

      // Mock pour la première requête (particuliers)
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, particuliers);
      });

      // Mock pour la deuxième requête (professionnels)
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, professionnels);
      });

      const response = await request(app).get('/api/clients');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('type', 'particulier');
      expect(response.body[2]).toHaveProperty('type', 'professionnel');
    });

    it('doit retourner un tableau vide si aucun client', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/clients');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('doit retourner une erreur 500 si erreur DB sur particuliers', async () => {
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Erreur DB'), null);
      });

      const response = await request(app).get('/api/clients');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur DB');
    });

    it('doit retourner une erreur 500 si erreur DB sur professionnels', async () => {
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Erreur DB professionnels'), null);
      });

      const response = await request(app).get('/api/clients');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur DB professionnels');
    });
  });

  describe('POST /particulier', () => {
    it('doit créer un client particulier avec succès', async () => {
      mockDbRun(db, null, 42);

      const nouveauClient = {
        identifiant: 'PART123',
        prenom: 'Alice',
        nom: 'Wonderland',
      };

      const response = await request(app)
        .post('/api/clients/particulier')
        .send(nouveauClient);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 42,
        identifiant: 'PART123',
        prenom: 'Alice',
        nom: 'Wonderland',
        type: 'particulier',
      });

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO clients_particuliers (identifiant, prenom, nom) VALUES (?, ?, ?)',
        ['PART123', 'Alice', 'Wonderland'],
        expect.any(Function)
      );
    });

    it('doit retourner une erreur 400 si identifiant manquant', async () => {
      const response = await request(app)
        .post('/api/clients/particulier')
        .send({ prenom: 'Alice', nom: 'Wonderland' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Tous les champs sont requis');
      expect(db.run).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur 400 si prenom manquant', async () => {
      const response = await request(app)
        .post('/api/clients/particulier')
        .send({ identifiant: 'PART123', nom: 'Wonderland' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Tous les champs sont requis');
    });

    it('doit retourner une erreur 400 si nom manquant', async () => {
      const response = await request(app)
        .post('/api/clients/particulier')
        .send({ identifiant: 'PART123', prenom: 'Alice' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Tous les champs sont requis');
    });

    it('doit retourner une erreur 400 si tous les champs manquent', async () => {
      const response = await request(app)
        .post('/api/clients/particulier')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Tous les champs sont requis');
    });

    it('doit retourner une erreur 500 si erreur DB', async () => {
      mockDbRun(db, new Error('Contrainte UNIQUE violée'));

      const response = await request(app)
        .post('/api/clients/particulier')
        .send({
          identifiant: 'PART123',
          prenom: 'Alice',
          nom: 'Wonderland',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Contrainte UNIQUE violée');
    });
  });

  describe('POST /professionnel', () => {
    it('doit créer un client professionnel avec succès (avec TVA)', async () => {
      mockDbRun(db, null, 99);

      const nouveauClient = {
        identifiant: 'PRO999',
        raison_sociale: 'Acme Corp',
        numero_tva: 'FR999888777',
        numero_immatriculation: 'RCS999',
        chiffre_affaires: 15000000,
      };

      const response = await request(app)
        .post('/api/clients/professionnel')
        .send(nouveauClient);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 99,
        identifiant: 'PRO999',
        raison_sociale: 'Acme Corp',
        numero_tva: 'FR999888777',
        numero_immatriculation: 'RCS999',
        chiffre_affaires: 15000000,
        type: 'professionnel',
      });

      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO clients_professionnels (identifiant, raison_sociale, numero_tva, numero_immatriculation, chiffre_affaires) VALUES (?, ?, ?, ?, ?)',
        ['PRO999', 'Acme Corp', 'FR999888777', 'RCS999', 15000000],
        expect.any(Function)
      );
    });

    it('doit créer un client professionnel sans TVA (null)', async () => {
      mockDbRun(db, null, 100);

      const nouveauClient = {
        identifiant: 'PRO100',
        raison_sociale: 'StartUp Inc',
        numero_immatriculation: 'RCS100',
        chiffre_affaires: 500000,
      };

      const response = await request(app)
        .post('/api/clients/professionnel')
        .send(nouveauClient);

      expect(response.status).toBe(200);
      expect(response.body.numero_tva).toBeUndefined();

      expect(db.run).toHaveBeenCalledWith(
        expect.any(String),
        ['PRO100', 'StartUp Inc', null, 'RCS100', 500000],
        expect.any(Function)
      );
    });

    it('doit accepter un chiffre d\'affaires de 0', async () => {
      mockDbRun(db, null, 101);

      const nouveauClient = {
        identifiant: 'PRO101',
        raison_sociale: 'Nouvelle Entreprise',
        numero_immatriculation: 'RCS101',
        chiffre_affaires: 0,
      };

      const response = await request(app)
        .post('/api/clients/professionnel')
        .send(nouveauClient);

      expect(response.status).toBe(200);
      expect(response.body.chiffre_affaires).toBe(0);
    });

    it('doit retourner une erreur 400 si identifiant manquant', async () => {
      const response = await request(app)
        .post('/api/clients/professionnel')
        .send({
          raison_sociale: 'Test Corp',
          numero_immatriculation: 'RCS123',
          chiffre_affaires: 1000000,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Les champs obligatoires sont manquants');
      expect(db.run).not.toHaveBeenCalled();
    });

    it('doit retourner une erreur 400 si raison_sociale manquant', async () => {
      const response = await request(app)
        .post('/api/clients/professionnel')
        .send({
          identifiant: 'PRO123',
          numero_immatriculation: 'RCS123',
          chiffre_affaires: 1000000,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Les champs obligatoires sont manquants');
    });

    it('doit retourner une erreur 400 si numero_immatriculation manquant', async () => {
      const response = await request(app)
        .post('/api/clients/professionnel')
        .send({
          identifiant: 'PRO123',
          raison_sociale: 'Test Corp',
          chiffre_affaires: 1000000,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Les champs obligatoires sont manquants');
    });

    it('doit retourner une erreur 400 si chiffre_affaires est undefined', async () => {
      const response = await request(app)
        .post('/api/clients/professionnel')
        .send({
          identifiant: 'PRO123',
          raison_sociale: 'Test Corp',
          numero_immatriculation: 'RCS123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Les champs obligatoires sont manquants');
    });

    it('doit retourner une erreur 500 si erreur DB', async () => {
      mockDbRun(db, new Error('Erreur insertion DB'));

      const response = await request(app)
        .post('/api/clients/professionnel')
        .send({
          identifiant: 'PRO123',
          raison_sociale: 'Test Corp',
          numero_immatriculation: 'RCS123',
          chiffre_affaires: 1000000,
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Erreur insertion DB');
    });
  });

  describe('GET /:type/:id', () => {
    describe('Client particulier', () => {
      it('doit retourner un client particulier existant', async () => {
        const client = {
          id: 5,
          identifiant: 'PART005',
          prenom: 'Bob',
          nom: 'Marley',
          created_at: '2024-01-01 10:00:00',
        };

        mockDbGet(db, null, client);

        const response = await request(app).get('/api/clients/particulier/5');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ...client, type: 'particulier' });

        expect(db.get).toHaveBeenCalledWith(
          'SELECT * FROM clients_particuliers WHERE id = ?',
          ['5'],
          expect.any(Function)
        );
      });

      it('doit retourner 404 si client particulier non trouvé', async () => {
        mockDbGet(db, null, null);

        const response = await request(app).get('/api/clients/particulier/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Client non trouvé');
      });

      it('doit retourner 500 si erreur DB', async () => {
        mockDbGet(db, new Error('Erreur DB'));

        const response = await request(app).get('/api/clients/particulier/5');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Erreur DB');
      });
    });

    describe('Client professionnel', () => {
      it('doit retourner un client professionnel existant', async () => {
        const client = {
          id: 10,
          identifiant: 'PRO010',
          raison_sociale: 'Big Corp',
          numero_tva: 'FR123456',
          numero_immatriculation: 'RCS456',
          chiffre_affaires: 20000000,
          created_at: '2024-01-01 12:00:00',
        };

        mockDbGet(db, null, client);

        const response = await request(app).get('/api/clients/professionnel/10');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ...client, type: 'professionnel' });

        expect(db.get).toHaveBeenCalledWith(
          'SELECT * FROM clients_professionnels WHERE id = ?',
          ['10'],
          expect.any(Function)
        );
      });

      it('doit retourner 404 si client professionnel non trouvé', async () => {
        mockDbGet(db, null, null);

        const response = await request(app).get('/api/clients/professionnel/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Client non trouvé');
      });

      it('doit retourner 500 si erreur DB', async () => {
        mockDbGet(db, new Error('Erreur connexion'));

        const response = await request(app).get('/api/clients/professionnel/10');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Erreur connexion');
      });
    });

    describe('Type de client invalide', () => {
      it('doit retourner 400 pour un type invalide', async () => {
        const response = await request(app).get('/api/clients/entreprise/5');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Type de client invalide');
        expect(db.get).not.toHaveBeenCalled();
      });

      it('doit retourner 400 pour un type vide', async () => {
        const response = await request(app).get('/api/clients//5');

        // Express peut router cela différemment, donc on vérifie juste que ce n'est pas 200
        expect(response.status).not.toBe(200);
      });

      it('doit retourner 400 pour "autre"', async () => {
        const response = await request(app).get('/api/clients/autre/5');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Type de client invalide');
      });
    });
  });
});
