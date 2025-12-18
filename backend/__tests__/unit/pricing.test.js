const { calculerPrixProduit } = require('../../utils/pricing');

describe('calculerPrixProduit', () => {
  // Produit de test avec les trois niveaux de prix
  const produit = {
    prix_particulier: 1500,
    prix_pro_haut: 1000,
    prix_pro_bas: 1150
  };

  describe('Client particulier', () => {
    test('doit retourner prix_particulier pour un client particulier', () => {
      const prix = calculerPrixProduit(produit, 'particulier', 0);
      expect(prix).toBe(1500);
    });

    test('doit ignorer le chiffre d\'affaires pour un particulier', () => {
      const prix = calculerPrixProduit(produit, 'particulier', 50000000);
      expect(prix).toBe(1500);
    });

    test('doit retourner prix_particulier même avec CA négatif', () => {
      const prix = calculerPrixProduit(produit, 'particulier', -1000);
      expect(prix).toBe(1500);
    });
  });

  describe('Client professionnel - CA bas (<=  10M)', () => {
    test('doit retourner prix_pro_bas pour CA = 0', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 0);
      expect(prix).toBe(1150);
    });

    test('doit retourner prix_pro_bas pour CA = 1,000,000', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 1000000);
      expect(prix).toBe(1150);
    });

    test('doit retourner prix_pro_bas pour CA = 5,000,000', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 5000000);
      expect(prix).toBe(1150);
    });

    test('doit retourner prix_pro_bas pour CA = 9,999,999', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 9999999);
      expect(prix).toBe(1150);
    });

    test('SEUIL CRITIQUE : doit retourner prix_pro_bas pour CA = 10,000,000 exactement', () => {
      // C'est un test critique car le seuil est à > 10M, donc 10M exactement doit utiliser prix_pro_bas
      const prix = calculerPrixProduit(produit, 'professionnel', 10000000);
      expect(prix).toBe(1150);
    });
  });

  describe('Client professionnel - CA haut (> 10M)', () => {
    test('doit retourner prix_pro_haut pour CA = 10,000,001', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 10000001);
      expect(prix).toBe(1000);
    });

    test('doit retourner prix_pro_haut pour CA = 15,000,000', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 15000000);
      expect(prix).toBe(1000);
    });

    test('doit retourner prix_pro_haut pour CA = 50,000,000', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 50000000);
      expect(prix).toBe(1000);
    });

    test('doit retourner prix_pro_haut pour CA = 100,000,000', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', 100000000);
      expect(prix).toBe(1000);
    });
  });

  describe('Cas limites et validation', () => {
    test('doit gérer un CA négatif pour un professionnel (utiliser prix_pro_bas)', () => {
      const prix = calculerPrixProduit(produit, 'professionnel', -1000);
      expect(prix).toBe(1150);
    });

    test('doit gérer un produit avec tous les prix à 0', () => {
      const produitZero = {
        prix_particulier: 0,
        prix_pro_haut: 0,
        prix_pro_bas: 0
      };
      const prix = calculerPrixProduit(produitZero, 'particulier', 0);
      expect(prix).toBe(0);
    });

    test('doit gérer des prix décimaux correctement', () => {
      const produitDecimal = {
        prix_particulier: 1599.99,
        prix_pro_haut: 999.50,
        prix_pro_bas: 1149.99
      };
      const prix = calculerPrixProduit(produitDecimal, 'particulier', 0);
      expect(prix).toBe(1599.99);
    });
  });

  describe('Différence de tarification', () => {
    test('prix_particulier doit être supérieur à prix_pro_bas', () => {
      expect(produit.prix_particulier).toBeGreaterThan(produit.prix_pro_bas);
    });

    test('prix_pro_bas doit être supérieur à prix_pro_haut', () => {
      expect(produit.prix_pro_bas).toBeGreaterThan(produit.prix_pro_haut);
    });

    test('les trois niveaux de prix doivent être différents', () => {
      expect(produit.prix_particulier).not.toBe(produit.prix_pro_bas);
      expect(produit.prix_pro_bas).not.toBe(produit.prix_pro_haut);
      expect(produit.prix_particulier).not.toBe(produit.prix_pro_haut);
    });
  });
});
