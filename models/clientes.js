const db = require('../db');

// 🔍 Buscar cliente
async function findCliente(telefono, id_bot) {
  const sql = `
    SELECT * 
    FROM clientes 
    WHERE telefono = ?
		AND id_bot = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [telefono, id_bot]);

  return rows.length > 0 ? rows[0] : null;
}

// ➕ Crear cliente nuevo
async function addCliente(telefono, id_bot, nombre, fecha, conversacion) {
  const sql = `
    INSERT INTO clientes 
    (telefono, id_bot, titular, status_actual, status_anterior, ultima_conversacion, ultimo_mensaje)
    VALUES (?, ?, ?, 0, 0, ?, ?)
  `;

  await db.execute(sql, [telefono, id_bot, nombre, conversacion, fecha]);
}

// 🔄 Actualizar cliente
async function updateCliente(telefono, id_bot, status_actual, status_anterior, fecha, conversacion) {
  const sql = `
    UPDATE clientes
    SET status_actual = ?,
        status_anterior = ?,
        ultimo_mensaje = ?,
        ultima_conversacion = ?
    WHERE telefono = ?
		AND id_bot = ?
  `;

  await db.execute(sql, [status_actual, status_anterior, fecha, conversacion, telefono, id_bot]);
}

module.exports = {
  findCliente,
  addCliente,
  updateCliente
};