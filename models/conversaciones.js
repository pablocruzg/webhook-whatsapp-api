const db = require('../db');

// 🔄 Obtener siguiente conversacion
async function getSiguienteConversacion() {
  const sql = `
		SELECT MAX(conversacion) AS conversacion
		FROM mensajes
  `;

  const [rows] = await db.execute(sql);

  return rows.length > 0 ? rows[0].conversacion : null;
}

module.exports = { getSiguienteConversacion };