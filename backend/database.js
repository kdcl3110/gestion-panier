const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'panier.db');
const db = new sqlite3.Database(dbPath);

// Initialiser la base de données
const initDatabase = () => {
  db.serialize(() => {
    // Table des clients particuliers
    db.run(`
      CREATE TABLE IF NOT EXISTS clients_particuliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifiant TEXT UNIQUE NOT NULL,
        prenom TEXT NOT NULL,
        nom TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des clients professionnels
    db.run(`
      CREATE TABLE IF NOT EXISTS clients_professionnels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifiant TEXT UNIQUE NOT NULL,
        raison_sociale TEXT NOT NULL,
        numero_tva TEXT,
        numero_immatriculation TEXT NOT NULL,
        chiffre_affaires REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des produits
    db.run(`
      CREATE TABLE IF NOT EXISTS produits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        nom TEXT NOT NULL,
        prix_particulier REAL NOT NULL,
        prix_pro_haut REAL NOT NULL,
        prix_pro_bas REAL NOT NULL
      )
    `);

    // Table des paniers
    db.run(`
      CREATE TABLE IF NOT EXISTS paniers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_type TEXT NOT NULL,
        client_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des items du panier
    db.run(`
      CREATE TABLE IF NOT EXISTS panier_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        panier_id INTEGER NOT NULL,
        produit_id INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        FOREIGN KEY (panier_id) REFERENCES paniers(id),
        FOREIGN KEY (produit_id) REFERENCES produits(id)
      )
    `);

    // Insérer les produits par défaut
    db.run(`
      INSERT OR IGNORE INTO produits (code, nom, prix_particulier, prix_pro_haut, prix_pro_bas)
      VALUES
        ('PHONE_HIGH', 'Téléphone Haut de Gamme', 1500, 1000, 1150),
        ('PHONE_MID', 'Téléphone Milieu de Gamme', 800, 550, 600),
        ('LAPTOP', 'Ordinateur Portable', 1200, 900, 1000)
    `);

    console.log('Base de données initialisée avec succès');
  });
};

module.exports = { db, initDatabase };
