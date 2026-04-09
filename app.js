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
const { sendWhatsAppMessage } = require('./models/whatsapp');
		const { getSiguienteEstado } = require('./models/secuencias');
		const { getOpciones } = require('./models/secuencias');
		const { getAccionByEstado } = require('./models/acciones');

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
	 const ID_BOT = 1; // ajusta si tienes varios bots
   const body = req.body;

    const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (!msg) return;

    let telefono = msg.from;
    const nombre = contact?.profile?.name || 'Sin nombre';
    const mensaje = msg.text?.body || '';

    // 🔧 Ajuste de numero de teléfono
    if (telefono.startsWith('52147')) {
      telefono = '5247' + telefono.slice(5);
    }

    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log('📩 Mensaje:', mensaje);



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
		
		
		const siguiente_estado = await getSiguienteEstado(ID_BOT, status_actual);		
		
		
		await updateCliente(
			telefono,
			status_actual,   // por ahora no cambia
			status_actual,   // anterior = mismo valor (temporal)
			fecha,
			conversacion
		);
		console.log('🔄 Cliente actualizado');



const opciones = await getOpciones(ID_BOT, siguiente_estado);

if (!opciones.length) {
  console.log('⚠️ No hay opciones');
  return;
}

// 📋 Construir menú
let menu = 'Selecciona una opción:\n';

opciones.forEach((op, index) => {
  menu += `${index + 1} - ${op.nombre}\n`;
});

await sendWhatsAppMessage(telefono, menu);

console.log('📤 Menú enviado');		




    await addMessage(1, nombre, telefono, fecha, mensaje, 'E');
    console.log('✅ Guardado en MySQL');




		// 🔄 Obtener siguiente estado
		let siguienteEstado = await getSiguienteEstado(ID_BOT, status_actual);

		if (!siguienteEstado) {
			console.log('⚠️ No hay siguiente estado');
			return;
		}

		// 🎯 Obtener acción del nuevo estado
		let accion = await getAccionByEstado(ID_BOT, siguienteEstado);

		if (!accion) {
			console.log('⚠️ No hay acción definida');
			return;
		}

		await sendWhatsAppMessage(telefono, accion.mensaje_accion);

		console.log('📤 Mensaje enviado a WhatsApp');
		
		
		

		
		
		

		await addMessage(conversacion, nombre, telefono, fecha, accion.mensaje_accion, 'S');
				
				



		// 🤖 Mostrar respuesta
		console.log('🤖 Respuesta:', accion.mensaje_accion);



		// 🔄 Actualizar cliente
		await updateCliente(
			telefono,
			siguienteEstado,
			status_actual,
			fecha,
			conversacion
		);

		console.log('🔄 Estado actualizado');
		



  } catch (err) {
    console.error('❌ Error:', err.message);
  }




  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});