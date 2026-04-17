const db = require('../db');

// 🔍 Buscar cliente
async function findCliente(telefono) {
  const sql = `
    SELECT * 
    FROM clientes 
    WHERE telefono = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [telefono]);

  return rows.length > 0 ? rows[0] : null;
}

// ➕ Crear cliente nuevo
async function addCliente(telefono, nombre, fecha, conversacion) {
  const sql = `
    INSERT INTO clientes 
    (telefono, titular, status_actual, status_anterior, ultima_conversacion, ultimo_mensaje)
    VALUES (?, ?, 0, 0, ?, ?)
  `;

  await db.execute(sql, [telefono, nombre, conversacion, fecha]);
}

// 🔄 Actualizar cliente
async function updateCliente(telefono, status_actual, status_anterior, fecha, conversacion) {
  const sql = `
    UPDATE clientes
    SET status_actual = ?,
        status_anterior = ?,
        ultimo_mensaje = ?,
        ultima_conversacion = ?
    WHERE telefono = ?
  `;

  await db.execute(sql, [status_actual, status_anterior, fecha, conversacion, telefono]);
}

module.exports = {
  findCliente,
  addCliente,
  updateCliente
};