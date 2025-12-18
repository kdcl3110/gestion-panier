
const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Récupérer tous les produits
router.get('/', (req, res) => {
  db.all('SELECT * FROM produits', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer un produit spécifique
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM produits WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(row);
  });
});

module.exports = router;
