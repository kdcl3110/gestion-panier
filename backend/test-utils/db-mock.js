/**
 * Mock pour la base de données SQLite
 * Permet de tester les routes sans dépendance à la vraie DB
 */

const createDbMock = () => {
  const mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    serialize: jest.fn((callback) => callback()),
  };

  return mockDb;
};

/**
 * Créer une réponse mockée pour db.all()
 */
const mockDbAll = (db, error = null, rows = []) => {
  db.all.mockImplementation((sql, params, callback) => {
    callback(error, rows);
  });
};

/**
 * Créer une réponse mockée pour db.get()
 */
const mockDbGet = (db, error = null, row = null) => {
  db.get.mockImplementation((sql, params, callback) => {
    callback(error, row);
  });
};

/**
 * Créer une réponse mockée pour db.run()
 */
const mockDbRun = (db, error = null, lastID = 1) => {
  db.run.mockImplementation(function(sql, params, callback) {
    if (callback) {
      callback.call({ lastID }, error);
    }
  });
};

module.exports = {
  createDbMock,
  mockDbAll,
  mockDbGet,
  mockDbRun,
};
