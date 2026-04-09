const db = require('../db');

// 🔄 Obtener siguiente estado
async function getSiguienteEstado(id_bot, estado_actual) {
  const sql = `
    SELECT sucesor 
    FROM secuencias
    WHERE id_bot = ?
    AND predecesor = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [id_bot, estado_actual]);

  return rows.length > 0 ? rows[0].sucesor : null;
}

module.exports = { getSiguienteEstado };