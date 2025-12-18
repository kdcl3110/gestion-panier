// Configuration globale pour Jest
process.env.NODE_ENV = 'test';
jest.setTimeout(10000);

// Supprimer les logs console pendant les tests (optionnel)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
// };
