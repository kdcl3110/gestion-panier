const { db, initDatabase } = require('./database');

// Initialiser la base de données
initDatabase();

// Attendre un peu que la base soit initialisée
setTimeout(() => {
  // Ajouter des clients de test
  const clientsParticuliers = [
    { identifiant: 'PART001', prenom: 'Jean', nom: 'Dupont' },
    { identifiant: 'PART002', prenom: 'Marie', nom: 'Martin' },
    { identifiant: 'PART003', prenom: 'Pierre', nom: 'Bernard' }
  ];

  const clientsProfessionnels = [
    {
      identifiant: 'PRO001',
      raison_sociale: 'TechCorp SA',
      numero_tva: 'FR12345678901',
      numero_immatriculation: '123456789',
      chiffre_affaires: 15000000
    },
    {
      identifiant: 'PRO002',
      raison_sociale: 'Startup Innovante SARL',
      numero_tva: 'FR98765432109',
      numero_immatriculation: '987654321',
      chiffre_affaires: 5000000
    },
    {
      identifiant: 'PRO003',
      raison_sociale: 'Grande Entreprise SAS',
      numero_tva: 'FR55555555555',
      numero_immatriculation: '555555555',
      chiffre_affaires: 50000000
    }
  ];

  // Insérer les clients particuliers
  clientsParticuliers.forEach(client => {
    db.run(
      'INSERT OR IGNORE INTO clients_particuliers (identifiant, prenom, nom) VALUES (?, ?, ?)',
      [client.identifiant, client.prenom, client.nom],
      (err) => {
        if (err) {
          console.error('Erreur insertion client particulier:', err);
        } else {
          console.log(`Client particulier ajouté: ${client.prenom} ${client.nom}`);
        }
      }
    );
  });

  // Insérer les clients professionnels
  clientsProfessionnels.forEach(client => {
    db.run(
      'INSERT OR IGNORE INTO clients_professionnels (identifiant, raison_sociale, numero_tva, numero_immatriculation, chiffre_affaires) VALUES (?, ?, ?, ?, ?)',
      [client.identifiant, client.raison_sociale, client.numero_tva, client.numero_immatriculation, client.chiffre_affaires],
      (err) => {
        if (err) {
          console.error('Erreur insertion client professionnel:', err);
        } else {
          console.log(`Client professionnel ajouté: ${client.raison_sociale}`);
        }
      }
    );
  });

  console.log('\n✓ Données de test ajoutées avec succès!');
  console.log('Vous pouvez maintenant démarrer le serveur avec: npm start\n');

  // Fermer la connexion après un délai
  setTimeout(() => {
    db.close();
  }, 1000);
}, 500);
