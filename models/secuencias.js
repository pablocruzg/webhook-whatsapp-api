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

// 🔄 Obtener opciones del menu
async function getOpciones(id_bot, estado_actual) {
  const sql = `
    SELECT s.sucesor, a.mensaje_accion, a.nombre
    FROM secuencias s
    JOIN acciones a ON a.id_accion = s.sucesor
    WHERE s.id_bot = ?
    AND s.predecesor = ?
  `;

  const [rows] = await db.execute(sql, [id_bot, estado_actual]);

  return rows;
}

async function esMenu(id_bot, estado_actual) {
  const sql = `
    SELECT COUNT(*) AS opciones
    FROM secuencias s
    JOIN acciones a ON a.id_accion = s.sucesor
    WHERE s.id_bot = ?
    AND s.predecesor = ?
  `;

  const [rows] = await db.execute(sql, [id_bot, estado_actual]);

  return rows[0].opciones > 1;
}

// 🔄 Obtener accion de la opcion seleccionada
async function getAccionDeOpcionMenu(id_bot, estado, opcion) {
  const offset = Math.max(0, parseInt(opcion) - 1);

  const sql = `
    SELECT s.sucesor, a.mensaje_accion, a.nombre
    FROM secuencias s
    JOIN acciones a ON a.id_accion = s.sucesor
    WHERE s.id_bot = ?
    AND s.predecesor = ?
    ORDER BY s.id_secuencia
    LIMIT 1 OFFSET ${offset}
  `;

  const [rows] = await db.execute(sql, [id_bot, estado]);

  return rows.length > 0 ? rows[0].sucesor : null;
}

module.exports = { getSiguienteEstado,
									 getOpciones,
									 esMenu,
									 getAccionDeOpcionMenu};