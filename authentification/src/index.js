const express = require('express');
const database = require ('./config/database');
const record = require('./routes/record');
const code = require('./routes/code');
const getEth = require('./routes/getEth');

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

app.use('/record', record);
app.post('/code', code);
app.get('/getEth', getEth);

app.listen(PORT, () => {
  console.log(`Le server tourne sur le port ${PORT}`);
});
