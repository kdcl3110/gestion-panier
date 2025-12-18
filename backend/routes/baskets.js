const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { calculerPrixProduit } = require('../utils/pricing');

// Calculer le montant total d'un panier
router.post('/calculer', (req, res) => {
  const { clientType, clientId, items } = req.body;

  if (!clientType || !clientId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  // Récupérer les informations du client
  const table = clientType === 'particulier' ? 'clients_particuliers' : 'clients_professionnels';
  const sqlClient = `SELECT * FROM ${table} WHERE id = ?`;

  db.get(sqlClient, [clientId], (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Récupérer les produits
    const productIds = items.map(item => item.produitId);
    const placeholders = productIds.map(() => '?').join(',');
    const sqlProduits = `SELECT * FROM produits WHERE id IN (${placeholders})`;

    db.all(sqlProduits, productIds, (err, produits) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Calculer le total
      let total = 0;
      const details = [];

      items.forEach(item => {
        const produit = produits.find(p => p.id === item.produitId);
        if (produit) {
          const prix = calculerPrixProduit(
            produit,
            clientType,
            clientType === 'professionnel' ? client.chiffre_affaires : 0
          );
          const sousTotal = prix * item.quantite;
          total += sousTotal;

          details.push({
            produit: produit.nom,
            quantite: item.quantite,
            prixUnitaire: prix,
            sousTotal: sousTotal
          });
        }
      });

      res.json({
        client: {
          type: clientType,
          nom: clientType === 'particulier'
            ? `${client.prenom} ${client.nom}`
            : client.raison_sociale
        },
        details,
        total
      });
    });
  });
});

// Créer un panier et sauvegarder
router.post('/', (req, res) => {
  const { clientType, clientId, items } = req.body;

  if (!clientType || !clientId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  const sqlPanier = 'INSERT INTO paniers (client_type, client_id) VALUES (?, ?)';

  db.run(sqlPanier, [clientType, clientId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const panierId = this.lastID;
    const sqlItems = 'INSERT INTO panier_items (panier_id, produit_id, quantite) VALUES (?, ?, ?)';

    let completed = 0;
    items.forEach(item => {
      db.run(sqlItems, [panierId, item.produitId, item.quantite], (err) => {
        if (err) {
          console.error(err);
        }
        completed++;
        if (completed === items.length) {
          res.json({ id: panierId, message: 'Panier créé avec succès' });
        }
      });
    });
  });
});

// Récupérer tous les paniers
router.get('/', (req, res) => {
  const sql = `
    SELECT p.*,
           GROUP_CONCAT(pi.produit_id || ':' || pi.quantite) as items
    FROM paniers p
    LEFT JOIN panier_items pi ON p.id = pi.panier_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
