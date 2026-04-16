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
const { sendWhatsAppImages }  = require('./models/whatsapp');
		const { getSiguienteEstado } = require('./models/secuencias');
		const { getOpciones } = require('./models/secuencias');
		const { esMenu } = require('./models/secuencias');
		const { getAccionDeOpcionMenu } = require('./models/secuencias');
		const { getAccionByEstado } = require('./models/acciones');
		const { getSiguienteConversacion } = require('./models/conversaciones');
		const { upsertCampoEnTabla } = require('./models/campos_en_tablas.js');

// GET Verifica Token de WebHook
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
		const ID_BOT =2; // ajusta si tienes varios bots
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
		let status_anterior;
		let conversacion;
		//-------------------------------------------------------------------------------------------------------------
		
		
		const fechaStatus = new Date(cliente.status_actual).getTime();
		const ahora = Date.now();


		
		if (cliente) {
			if(cliente.status_actual==0){
				conversacion = await getSiguienteConversacion();
				status_actual = await getSiguienteEstado(ID_BOT, 0);			
				status_anterior = 0;
				console.log('🆕 Cliente recuperado');
			} else {
				if ((ahora - fechaStatus) > (30 * 60 * 1000)) {
					// Reiniciar bot, por tiempo excedido
					status_actual = await getSiguienteEstado(ID_BOT, 0);			
					status_anterior = 0;
				} else {
					status_actual = cliente.status_actual;
					status_anterior = cliente.status_anterior;
					conversacion = await cliente.ultima_conversacion;
				}
			}
		} else {
			conversacion = await getSiguienteConversacion();
			await addCliente(telefono, nombre, fecha, conversacion);
			status_actual = await getSiguienteEstado(ID_BOT, 0);			
			status_anterior = 0;
			console.log('🆕 Cliente creado');
		}		
    console.log('📩 Conversacion:', conversacion);
		
		//Identificar si es respuesta de Opcion-Menu o Texto Input
		let respuestaMenu = await esMenu(ID_BOT, status_anterior);
		console.log('🔄 Es respuesta de menu:', respuestaMenu, status_actual, ' - ',status_anterior);
		
		let status_siguiente;
		let accion;
		let accion_anterior;
		let ioresult;
		
		if (respuestaMenu) {
			if (!/^\d+$/.test(mensaje)) {
					await sendWhatsAppMessage(telefono, 'Ingrese una opcion válida.');
					console.log('❌ No es número');
					return;
			}

			const opcion = Number(mensaje);

			if (!(await getAccionDeOpcionMenu(ID_BOT, status_anterior, opcion))) {
					await sendWhatsAppMessage(telefono, 'Ingrese una opcion válida.');
					console.log('❌ Opción no existe en el menú');
					return;
			}

			// ✅ Opción válida
			status_actual = await getAccionDeOpcionMenu(ID_BOT, status_anterior, opcion);
			status_siguiente = await getSiguienteEstado(ID_BOT, status_actual);			
		} else {		
			accion_anterior = await getAccionByEstado(ID_BOT, status_anterior);
			if (!accion_anterior) {
//					console.log('🟢 Primer estado: no hay acción anterior');
			} 
			else if(accion_anterior.campo)
			{
//				console.log('⚠️ Guardar valor de campo ', conversacion, ' - ', telefono, ' - ' , nombre, ' - ' , fecha, ' - ', accion_anterior.campo, ' - ', accion_anterior.tabla, ' - ', mensaje);
				ioresult = await upsertCampoEnTabla(conversacion, telefono, nombre, fecha, accion_anterior.tabla, accion_anterior.campo, mensaje);
			} else {
//				console.log('No es campo input.');
			}
			status_siguiente = await getSiguienteEstado(ID_BOT, status_actual);		
		}	
				
		await updateCliente(
			telefono,
			status_actual,   // por ahora no cambia
			status_anterior,   // anterior = mismo valor (temporal)
			fecha,
			conversacion
		);
//		console.log('🎚 Cliente actualizado');

    await addMessage(conversacion, nombre, telefono, fecha, mensaje, 'E');
//    console.log('✅ Guardado en MySQL');

		// 🎯 Obtener acción del estado actual
		accion = await getAccionByEstado(ID_BOT, status_actual);
//console.log(JSON.stringify(accion, null, 2));		
		if (!accion) {
			console.log('⚠️ No hay acción definida para status actual ', status_actual);
			return;
		}
		
		if(accion.enviar_imagen){
			sendWhatsAppImages(telefono, accion.enviar_imagen)
			console.log('💫 Enviar imagen ', accion.enviar_imagen);
		}
		
		await sendWhatsAppMessage(telefono, accion.mensaje_accion);
//		console.log('📤 Acción de estado actual enviada.');
		
		// Obtener opciones del menu
		const opciones = await getOpciones(ID_BOT, status_actual);
		if (!opciones.length) {
//			console.log('⚠️ No hay opciones');
//			return;
		}
		// 📋 Construir menú
		let menu = 'Selecciona una opción:\n';
		opciones.forEach((op, index) => {
			menu += `${index + 1} - ${op.nombre}\n`;
		});
		if (opciones.length>1) {
			await sendWhatsAppMessage(telefono, menu);
			console.log('📤 Menú enviado');		
		}
		
		// Agregar mensaje a Base de Datos
		await addMessage(conversacion, nombre, telefono, fecha, accion.mensaje_accion, 'S');
		
		// 🤖 Mostrar respuesta
//		console.log('🤖 Respuesta:', accion.mensaje_accion);
//		console.log('cierra_conversacion:', accion.cierra_conversacion);

		// 🔄 Actualizar cliente
		if(accion.cierra_conversacion=='S'){
			status_actual=0;
			status_siguiente=0;
		}
		await updateCliente(
			telefono,
			status_siguiente,
			status_actual,
			fecha,
			conversacion
		);

//		console.log('🔄 Estado actualizado');
//----------------------------------------------------------------------------------
  } catch (err) {
    console.error('❌ Error:', err.message);
  }



/*
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
*/
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});