require('dotenv').config({ path: '/etc/app.env' });
const express = require('express');
const db = require('./database/db');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.get('/', (req, res) => {
  res.send('API rodando em produção!');
});

app.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, email FROM users', []);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Server running on port', process.env.PORT);
});