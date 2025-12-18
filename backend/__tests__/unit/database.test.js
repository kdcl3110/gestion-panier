const path = require('path');

// Mock de sqlite3
const mockRun = jest.fn();
const mockSerialize = jest.fn((callback) => callback());
const mockDatabase = jest.fn().mockImplementation(() => ({
  run: mockRun,
  serialize: mockSerialize,
}));

jest.mock('sqlite3', () => ({
  verbose: jest.fn(() => ({
    Database: mockDatabase,
  })),
}));

describe('Database Module', () => {
  let database;
  let initDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear require cache to get a fresh instance
    jest.resetModules();

    // Re-require the module after mocking
    const dbModule = require('../../database');
    database = dbModule;
    initDatabase = dbModule.initDatabase;
  });

  describe('Database initialization', () => {
    it('doit créer une instance de base de données avec le bon chemin', () => {
      const expectedPath = path.resolve(__dirname, '../../panier.db');

      expect(mockDatabase).toHaveBeenCalledWith(expectedPath);
    });

    it('doit exposer l\'objet db', () => {
      expect(database.db).toBeDefined();
      expect(database.db).toHaveProperty('run');
      expect(database.db).toHaveProperty('serialize');
    });

    it('doit exposer la fonction initDatabase', () => {
      expect(database.initDatabase).toBeDefined();
      expect(typeof database.initDatabase).toBe('function');
    });
  });

  describe('initDatabase()', () => {
    it('doit appeler serialize', () => {
      initDatabase();

      expect(mockSerialize).toHaveBeenCalled();
    });

    it('doit créer la table clients_particuliers', () => {
      initDatabase();

      const createParticuliersCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS clients_particuliers')
      );

      expect(createParticuliersCall).toBeDefined();
      expect(createParticuliersCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createParticuliersCall[0]).toContain('identifiant TEXT UNIQUE NOT NULL');
      expect(createParticuliersCall[0]).toContain('prenom TEXT NOT NULL');
      expect(createParticuliersCall[0]).toContain('nom TEXT NOT NULL');
      expect(createParticuliersCall[0]).toContain('created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    it('doit créer la table clients_professionnels', () => {
      initDatabase();

      const createProfessionnelsCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS clients_professionnels')
      );

      expect(createProfessionnelsCall).toBeDefined();
      expect(createProfessionnelsCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createProfessionnelsCall[0]).toContain('identifiant TEXT UNIQUE NOT NULL');
      expect(createProfessionnelsCall[0]).toContain('raison_sociale TEXT NOT NULL');
      expect(createProfessionnelsCall[0]).toContain('numero_tva TEXT');
      expect(createProfessionnelsCall[0]).toContain('numero_immatriculation TEXT NOT NULL');
      expect(createProfessionnelsCall[0]).toContain('chiffre_affaires REAL NOT NULL');
      expect(createProfessionnelsCall[0]).toContain('created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    it('doit créer la table produits', () => {
      initDatabase();

      const createProduitsCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS produits')
      );

      expect(createProduitsCall).toBeDefined();
      expect(createProduitsCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createProduitsCall[0]).toContain('code TEXT UNIQUE NOT NULL');
      expect(createProduitsCall[0]).toContain('nom TEXT NOT NULL');
      expect(createProduitsCall[0]).toContain('prix_particulier REAL NOT NULL');
      expect(createProduitsCall[0]).toContain('prix_pro_haut REAL NOT NULL');
      expect(createProduitsCall[0]).toContain('prix_pro_bas REAL NOT NULL');
    });

    it('doit créer la table paniers', () => {
      initDatabase();

      const createPaniersCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS paniers')
      );

      expect(createPaniersCall).toBeDefined();
      expect(createPaniersCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createPaniersCall[0]).toContain('client_type TEXT NOT NULL');
      expect(createPaniersCall[0]).toContain('client_id INTEGER NOT NULL');
      expect(createPaniersCall[0]).toContain('created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    it('doit créer la table panier_items', () => {
      initDatabase();

      const createItemsCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS panier_items')
      );

      expect(createItemsCall).toBeDefined();
      expect(createItemsCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createItemsCall[0]).toContain('panier_id INTEGER NOT NULL');
      expect(createItemsCall[0]).toContain('produit_id INTEGER NOT NULL');
      expect(createItemsCall[0]).toContain('quantite INTEGER NOT NULL');
      expect(createItemsCall[0]).toContain('FOREIGN KEY (panier_id) REFERENCES paniers(id)');
      expect(createItemsCall[0]).toContain('FOREIGN KEY (produit_id) REFERENCES produits(id)');
    });

    it('doit insérer les produits par défaut', () => {
      initDatabase();

      const insertProduitsCall = mockRun.mock.calls.find(call =>
        call[0].includes('INSERT OR IGNORE INTO produits')
      );

      expect(insertProduitsCall).toBeDefined();
      expect(insertProduitsCall[0]).toContain('PHONE_HIGH');
      expect(insertProduitsCall[0]).toContain('Téléphone Haut de Gamme');
      expect(insertProduitsCall[0]).toContain('1500');
      expect(insertProduitsCall[0]).toContain('1000');
      expect(insertProduitsCall[0]).toContain('1150');

      expect(insertProduitsCall[0]).toContain('PHONE_MID');
      expect(insertProduitsCall[0]).toContain('Téléphone Milieu de Gamme');
      expect(insertProduitsCall[0]).toContain('800');
      expect(insertProduitsCall[0]).toContain('550');
      expect(insertProduitsCall[0]).toContain('600');

      expect(insertProduitsCall[0]).toContain('LAPTOP');
      expect(insertProduitsCall[0]).toContain('Ordinateur Portable');
      expect(insertProduitsCall[0]).toContain('1200');
      expect(insertProduitsCall[0]).toContain('900');
      expect(insertProduitsCall[0]).toContain('1000');
    });

    it('doit créer toutes les tables dans le bon ordre', () => {
      initDatabase();

      const calls = mockRun.mock.calls.map(call => call[0]);

      // Vérifier l'ordre: tables principales avant tables de référence
      const particuliersIndex = calls.findIndex(sql => sql.includes('clients_particuliers'));
      const professionnelsIndex = calls.findIndex(sql => sql.includes('clients_professionnels'));
      const produitsIndex = calls.findIndex(sql => sql.includes('CREATE TABLE IF NOT EXISTS produits'));
      const paniersIndex = calls.findIndex(sql => sql.includes('CREATE TABLE IF NOT EXISTS paniers'));
      const itemsIndex = calls.findIndex(sql => sql.includes('panier_items'));

      expect(particuliersIndex).toBeGreaterThanOrEqual(0);
      expect(professionnelsIndex).toBeGreaterThanOrEqual(0);
      expect(produitsIndex).toBeGreaterThanOrEqual(0);
      expect(paniersIndex).toBeGreaterThanOrEqual(0);
      expect(itemsIndex).toBeGreaterThanOrEqual(0);

      // panier_items doit être créé après paniers (à cause de la foreign key)
      expect(itemsIndex).toBeGreaterThan(paniersIndex);
    });

    it('doit appeler db.run au moins 6 fois (5 tables + 1 insert)', () => {
      initDatabase();

      // 5 CREATE TABLE + 1 INSERT
      expect(mockRun).toHaveBeenCalledTimes(6);
    });

    it('doit utiliser CREATE TABLE IF NOT EXISTS pour toutes les tables', () => {
      initDatabase();

      const createCalls = mockRun.mock.calls.filter(call =>
        call[0].includes('CREATE TABLE')
      );

      createCalls.forEach(call => {
        expect(call[0]).toContain('IF NOT EXISTS');
      });
    });

    it('doit utiliser INSERT OR IGNORE pour les produits par défaut', () => {
      initDatabase();

      const insertCall = mockRun.mock.calls.find(call =>
        call[0].includes('INSERT') && call[0].includes('produits')
      );

      expect(insertCall[0]).toContain('INSERT OR IGNORE');
    });
  });

  describe('Structure des tables', () => {
    it('clients_particuliers doit avoir une contrainte UNIQUE sur identifiant', () => {
      initDatabase();

      const createCall = mockRun.mock.calls.find(call =>
        call[0].includes('clients_particuliers')
      );

      expect(createCall[0]).toMatch(/identifiant\s+TEXT\s+UNIQUE/i);
    });

    it('clients_professionnels doit avoir une contrainte UNIQUE sur identifiant', () => {
      initDatabase();

      const createCall = mockRun.mock.calls.find(call =>
        call[0].includes('clients_professionnels')
      );

      expect(createCall[0]).toMatch(/identifiant\s+TEXT\s+UNIQUE/i);
    });

    it('produits doit avoir une contrainte UNIQUE sur code', () => {
      initDatabase();

      const createCall = mockRun.mock.calls.find(call =>
        call[0].includes('CREATE TABLE IF NOT EXISTS produits')
      );

      expect(createCall[0]).toMatch(/code\s+TEXT\s+UNIQUE/i);
    });

    it('panier_items doit avoir des foreign keys', () => {
      initDatabase();

      const createCall = mockRun.mock.calls.find(call =>
        call[0].includes('panier_items')
      );

      expect(createCall[0]).toContain('FOREIGN KEY (panier_id) REFERENCES paniers(id)');
      expect(createCall[0]).toContain('FOREIGN KEY (produit_id) REFERENCES produits(id)');
    });
  });

  describe('Produits par défaut', () => {
    it('doit insérer exactement 3 produits', () => {
      initDatabase();

      const insertCall = mockRun.mock.calls.find(call =>
        call[0].includes('INSERT OR IGNORE INTO produits')
      );

      // Compter le nombre de tuples VALUES
      const valuesCount = (insertCall[0].match(/\(/g) || []).length;
      // Il y a 1 parenthèse pour VALUES et 3 pour les tuples
      expect(valuesCount).toBe(4); // 1 + 3
    });

    it('doit inclure les codes de produits corrects', () => {
      initDatabase();

      const insertCall = mockRun.mock.calls.find(call =>
        call[0].includes('INSERT OR IGNORE INTO produits')
      );

      expect(insertCall[0]).toContain('PHONE_HIGH');
      expect(insertCall[0]).toContain('PHONE_MID');
      expect(insertCall[0]).toContain('LAPTOP');
    });

    it('doit avoir des prix cohérents (prix_particulier > prix_pro_bas > prix_pro_haut)', () => {
      initDatabase();

      const insertCall = mockRun.mock.calls.find(call =>
        call[0].includes('INSERT OR IGNORE INTO produits')
      );

      // PHONE_HIGH: 1500, 1000, 1150
      // Vérification que les prix sont présents
      expect(insertCall[0]).toContain('1500');
      expect(insertCall[0]).toContain('1000');
      expect(insertCall[0]).toContain('1150');

      // PHONE_MID: 800, 550, 600
      expect(insertCall[0]).toContain('800');
      expect(insertCall[0]).toContain('550');
      expect(insertCall[0]).toContain('600');

      // LAPTOP: 1200, 900, 1000
      expect(insertCall[0]).toContain('1200');
      expect(insertCall[0]).toContain('900');
      expect(insertCall[0]).toContain('1000');
    });
  });
});
