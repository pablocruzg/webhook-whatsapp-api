const db = require('../db');


function escapeId(id) {
    return `\`${id.replace(/`/g, '')}\``;
}


async function upsertCampoEnTabla(
    conversacion,
    telefono,
    nombre,
    fecha_hora,
    tabla,
    campo,
    valor
) {
		valor = valor.trim();
    const sql = `
        INSERT INTO ${escapeId(tabla)}
        (conversacion, telefono, nombre, fecha_hora, ${escapeId(campo)})
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            fecha_hora = VALUES(fecha_hora),
            ${escapeId(campo)} = VALUES(${escapeId(campo)})
    `;

    const [result] = await db.execute(sql, [
        conversacion,
        telefono,
        nombre,
        fecha_hora,
        valor
    ]);

    return result.affectedRows > 0;
}


module.exports = { upsertCampoEnTabla };