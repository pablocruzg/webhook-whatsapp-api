// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;


// Route for GET requests
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }
  
  // 👇 IMPORTANTE: no bloquear
  res.send('OK');
});

// Route for POST requests 
const axios = require('axios');
app.post('/', (req, res) => { 
const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19); 
console.log(\n\nWebhook received ${timestamp}\n); 
console.log(JSON.stringify(req.body, null, 2)); 
res.status(200).end(); 
});




  try {
    // 👇 ENVÍA A TU PHP
    await axios.post('https://www.asesoria-web.com.mx/chatbotwapp/webhook.php', req.body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });

    console.log('✅ Enviado a PHP correctamente');

  } catch (error) {
  console.error('❌ Error completo:');

  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    console.error('No hubo respuesta del servidor');
  } else {
    console.error('Error general:', error.message);
  }
}


// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
