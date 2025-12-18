const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Récupérer tous les clients (particuliers et professionnels)
router.get('/', (req, res) => {
  const particuliers = new Promise((resolve, reject) => {
    db.all('SELECT * FROM clients_particuliers', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => ({ ...row, type: 'particulier' })));
    });
  });

  const professionnels = new Promise((resolve, reject) => {
    db.all('SELECT * FROM clients_professionnels', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => ({ ...row, type: 'professionnel' })));
    });
  });

  Promise.all([particuliers, professionnels])
    .then(([part, prof]) => {
      res.json([...part, ...prof]);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Créer un client particulier
router.post('/particulier', (req, res) => {
  const { identifiant, prenom, nom } = req.body;

  if (!identifiant || !prenom || !nom) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const sql = 'INSERT INTO clients_particuliers (identifiant, prenom, nom) VALUES (?, ?, ?)';
  db.run(sql, [identifiant, prenom, nom], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, identifiant, prenom, nom, type: 'particulier' });
  });
});

// Créer un client professionnel
router.post('/professionnel', (req, res) => {
  const { identifiant, raison_sociale, numero_tva, numero_immatriculation, chiffre_affaires } = req.body;

  if (!identifiant || !raison_sociale || !numero_immatriculation || chiffre_affaires === undefined) {
    return res.status(400).json({ error: 'Les champs obligatoires sont manquants' });
  }

  const sql = 'INSERT INTO clients_professionnels (identifiant, raison_sociale, numero_tva, numero_immatriculation, chiffre_affaires) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [identifiant, raison_sociale, numero_tva || null, numero_immatriculation, chiffre_affaires], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      id: this.lastID,
      identifiant,
      raison_sociale,
      numero_tva,
      numero_immatriculation,
      chiffre_affaires,
      type: 'professionnel'
    });
  });
});

// Récupérer un client spécifique
router.get('/:type/:id', (req, res) => {
  const { type, id } = req.params;

  if (type !== 'particulier' && type !== 'professionnel') {
    return res.status(400).json({ error: 'Type de client invalide' });
  }

  const table = type === 'particulier' ? 'clients_particuliers' : 'clients_professionnels';
  const sql = `SELECT * FROM ${table} WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json({ ...row, type });
  });
});

module.exports = router;
