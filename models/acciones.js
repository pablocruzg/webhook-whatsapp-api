const db = require('../db');

// 🎯 Obtener acción por estado
async function getAccionByEstado(id_bot, estado) {
  const sql = `
    SELECT *
    FROM acciones
    WHERE id_bot = ?
    AND id_accion = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [id_bot, estado]);

  return rows.length > 0 ? rows[0] : null;
}

module.exports = { getAccionByEstado };