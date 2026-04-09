const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const { addMessage } = require('./models/mensajes');
const {
  findCliente,
  addCliente,
  updateCliente
} = require('./models/clientes');

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

/* Codigo para validar la conexion a MySql
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
*/

// POST
const axios = require('axios');

app.post('/', async (req, res) => {

  res.status(200).end(); // ⚡ responder inmediato (como PHP)

  try {
    const body = req.body;

    const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (!msg) return;

    let telefono = msg.from;
    const nombre = contact?.profile?.name || 'Sin nombre';
    const mensaje = msg.text?.body || '';

    // 🔧 Ajuste igual que tu PHP (MUY IMPORTANTE)
    if (telefono.startsWith('52147')) {
      telefono = '5247' + telefono.slice(5);
    }

    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log('📩 Mensaje:', mensaje);

    await addMessage(1, nombre, telefono, fecha, mensaje, 'E');

    console.log('✅ Guardado en MySQL');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

let cliente = await findCliente(telefono);

let status_actual;
let conversacion;

if (cliente) {
  status_actual = cliente.status_actual;
  conversacion = cliente.ultima_conversacion;
} else {
  // 🔢 Obtener nueva conversación (simple por ahora)
  conversacion = 1; // luego lo mejoramos

  await addCliente(telefono, nombre, fecha, conversacion);

  status_actual = 0;

  console.log('🆕 Cliente creado');
}


  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));


  res.status(200).end();
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});