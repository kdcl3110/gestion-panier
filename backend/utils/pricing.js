/**
 * Calcule le prix d'un produit selon le type de client et son chiffre d'affaires
 *
 * @param {Object} produit - Produit avec les différents niveaux de prix
 * @param {number} produit.prix_particulier - Prix pour les clients particuliers
 * @param {number} produit.prix_pro_haut - Prix pour les clients professionnels avec CA > 10M
 * @param {number} produit.prix_pro_bas - Prix pour les clients professionnels avec CA <= 10M
 * @param {string} clientType - Type de client ('particulier' ou 'professionnel')
 * @param {number} chiffreAffaires - Chiffre d'affaires du client (utilisé pour les professionnels)
 * @returns {number} Le prix calculé selon le type de client
 */
const calculerPrixProduit = (produit, clientType, chiffreAffaires) => {
  if (clientType === 'particulier') {
    return produit.prix_particulier;
  } else {
    // Client professionnel
    // Seuil à 10 millions : > 10M utilise prix_pro_haut, sinon prix_pro_bas
    if (chiffreAffaires > 10000000) {
      return produit.prix_pro_haut;
    } else {
      return produit.prix_pro_bas;
    }
  }
};

module.exports = { calculerPrixProduit };
