const db = require('../db');

// 🔄 Obtener siguiente conversacion
async function getSiguienteConversacion() {
  const sql = `
    SELECT IFNULL(MAX(conversacion), 0) + 1 AS siguiente
    FROM mensajes
  `;

  const [rows] = await db.execute(sql);

  return rows[0].siguiente;
}
module.exports = { getSiguienteConversacion };