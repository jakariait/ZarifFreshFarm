// require('dotenv').config();
// const app = require('./app');
//
// const PORT = process.env.PORT || 5050;
//
// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });


const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API running on Vercel' });
});

module.exports = app;