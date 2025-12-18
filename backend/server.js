const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialiser la base de données
initDatabase();

// Routes
const clientsRoutes = require('./routes/clients');
const produitsRoutes = require('./routes/products');
const paniersRoutes = require('./routes/baskets');

app.use('/api/clients', clientsRoutes);
app.use('/api/products', produitsRoutes);
app.use('/api/baskets', paniersRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API de gestion des paniers - Bienvenue!' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
