const db = require('../db');

async function addMessage(conversacion, nombre, telefono, fecha, mensaje, tipo) {
  const sql = `
    INSERT INTO mensajes 
    (conversacion, nombre, telefono, fecha_hora, mensaje, entrada_salida)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await db.execute(sql, [conversacion, nombre, telefono, fecha, mensaje, tipo]);
}

module.exports = { addMessage };