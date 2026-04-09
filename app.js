const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const { addMessage } = require('./models/mensajes');

// GET
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }

  res.send('OK');
});

console.log('DB_HOST:', process.env.DB_HOST);
const db = require('./db');

(async () => {
  try {
    const conn = await db.getConnection();
    console.log('✅ Conectado a MySQL');
    conn.release();
  } catch (err) {
    console.error('❌ Error MySQL:', err.message);
  }
})();

// POST
const axios = require('axios');

app.post('/', async (req, res) => {

  res.status(200).end(); // 🔥 RESPONDER INMEDIATO (como PHP)

  try {
    const body = req.body;

    const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (!msg) return;

    const telefono = msg.from;
    const nombre = contact?.profile?.name || 'Sin nombre';
    const mensaje = msg.text?.body || '';
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log('Mensaje:', mensaje);

    await addMessage(1, nombre, telefono, fecha, mensaje, 'E');

    console.log('✅ Guardado');

  } catch (err) {
    console.error('Error:', err);
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));


  res.status(200).end();
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});