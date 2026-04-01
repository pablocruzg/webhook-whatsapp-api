app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // 🔍 log para ver qué llega
  console.log("QUERY:", req.query);

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }

  // 👇 IMPORTANTE: no bloquear pruebas
  res.send('Webhook activo');
});
