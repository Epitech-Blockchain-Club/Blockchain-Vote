const express = require('express');
const database = require ('./config/database');
const register = require('./controllers/controleur');
const login = require('./controllers/authControler');
require('dotenv').config();
const PORT = process.env.PORT;

const app = express();

database.authenticate()
  .then(() => {
    console.log('Succès de la connection à la base de donné');
  })
  .catch(err => {
    console.error('Un problèmes est survenu lors de la connecton:', err);
  });

database.sync()
    .then (()=>console.log('Base de sonnée créé!'));

app.use('/api/register', register);
app.post('/api/login', login)

app.listen(PORT, () => {
  console.log(`Le server tourne sur le port ${PORT}`);
});
