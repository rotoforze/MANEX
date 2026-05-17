import { promisePool as pool } from '../db.mjs';
import crypto from 'crypto';
import { hashContrasenia, verificarContrasenia } from '../empleados/hashDeContrasenias.mjs';



async function ensureTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS solicitud_password (
            id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
            username         VARCHAR(255) NOT NULL,
            estado           VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
            fecha_solicitud  DATETIME     NOT NULL DEFAULT NOW(),
            fecha_resolucion DATETIME     DEFAULT NULL
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset (
            token       VARCHAR(8)   NOT NULL PRIMARY KEY,
            username    VARCHAR(255) NOT NULL,
            expires_at  DATETIME     NOT NULL,
            usado       TINYINT(1)   NOT NULL DEFAULT 0
        )
    `);
}

/**
 * Cambia la contraseña del usuario autenticado.
 * POST /password  body: { password_actual, password_nuevo, confirmar }
 */
export async function cambiarPassword(req, res) {
    const { password_actual, password_nuevo, confirmar } = req.body;
    const username = req.authUsername;

    if (!password_actual || !password_nuevo || !confirmar)
        return res.status(400).json({ status: 400, message: 'Faltan campos obligatorios.' });

    if (password_nuevo !== confirmar)
        return res.status(400).json({ status: 400, message: 'Las contraseñas nuevas no coinciden.' });

    if (password_nuevo.length < 6)
        return res.status(400).json({ status: 400, message: 'La contraseña debe tener al menos 6 caracteres.' });

    try {
        const [rows] = await pool.query('SELECT password FROM usuario WHERE USERNAME = ?', [username]);
        if (!rows.length)
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado.' });

        const valida = await verificarContrasenia(password_actual, rows[0].password);
        if (!valida)
            return res.status(401).json({ status: 401, message: 'La contraseña actual es incorrecta.' });

        const hash = await hashContrasenia(password_nuevo);
        await pool.query('UPDATE usuario SET password = ? WHERE USERNAME = ?', [hash, username]);

        return res.status(200).json({ status: 200, message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('Error en cambiarPassword:', err);
        return res.status(500).json({ status: 500, message: 'Error interno del servidor.' });
    }
}

/**
 * Crea una solicitud de cambio de contraseña para revisión de RRHH.
 * Ruta pública.  POST /recuperar  body: { username }
 */
export async function solicitarRecuperacion(req, res) {
    const { username } = req.body;
    if (!username)
        return res.status(400).json({ status: 400, message: 'El nombre de usuario es obligatorio.' });

    try {
        await ensureTables();

        const [existe] = await pool.query('SELECT USERNAME FROM usuario WHERE USERNAME = ?', [username]);
        if (!existe.length)
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado.' });

        // Cancelar solicitudes pendientes anteriores del mismo usuario
        await pool.query(
            "UPDATE solicitud_password SET estado = 'Cancelada', fecha_resolucion = NOW() WHERE username = ? AND estado = 'Pendiente'",
            [username]
        );

        await pool.query('INSERT INTO solicitud_password (username) VALUES (?)', [username]);

        return res.status(200).json({
            status: 200,
            message: 'Solicitud enviada. RRHH revisará tu solicitud y te proporcionará un código de recuperación.',
        });
    } catch (err) {
        console.error('Error en solicitarRecuperacion:', err);
        return res.status(500).json({ status: 500, message: 'Error interno del servidor.' });
    }
}

/**
 * Lista las solicitudes de cambio de contraseña pendientes (para RRHH).
 * GET /password-requests  — autenticado, dept >= 5
 */
export async function listarSolicitudes(req, res) {
    try {
        await ensureTables();
        const [rows] = await pool.query(
            "SELECT id, username, estado, fecha_solicitud FROM solicitud_password WHERE estado = 'Pendiente' ORDER BY fecha_solicitud ASC"
        );
        return res.status(200).json({ status: 200, solicitudes: rows });
    } catch (err) {
        console.error('Error en listarSolicitudes:', err);
        return res.status(500).json({ status: 500, message: 'Error interno del servidor.' });
    }
}

/**
 * RRHH aprueba o rechaza una solicitud.
 * POST /password-requests  body: { id, accion: 'aprobar' | 'rechazar' }
 * En caso de aprobar: genera código y lo devuelve para que RRHH lo comunique al usuario.
 */
export async function gestionarSolicitud(req, res) {
    const { id, accion } = req.body;
    if (!id || !accion)
        return res.status(400).json({ status: 400, message: 'Faltan campos obligatorios.' });

    try {
        await ensureTables();

        const [rows] = await pool.query(
            "SELECT * FROM solicitud_password WHERE id = ? AND estado = 'Pendiente'",
            [id]
        );
        if (!rows.length)
            return res.status(404).json({ status: 404, message: 'Solicitud no encontrada o ya gestionada.' });

        const { username } = rows[0];

        if (accion === 'rechazar') {
            await pool.query(
                "UPDATE solicitud_password SET estado = 'Rechazada', fecha_resolucion = NOW() WHERE id = ?",
                [id]
            );
            return res.status(200).json({ status: 200, message: `Solicitud de ${username} rechazada.` });
        }

        if (accion === 'aprobar') {
            // Invalidar tokens anteriores del usuario
            await pool.query('UPDATE password_reset SET usado = 1 WHERE username = ?', [username]);

            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            await pool.query(
                'INSERT INTO password_reset (token, username, expires_at) VALUES (?, ?, ?)',
                [code, username, expiresAt]
            );
            await pool.query(
                "UPDATE solicitud_password SET estado = 'Aprobada', fecha_resolucion = NOW() WHERE id = ?",
                [id]
            );

            return res.status(200).json({ status: 200, code, username, message: `Solicitud de ${username} aprobada.` });
        }

        return res.status(400).json({ status: 400, message: 'Acción no válida. Usa "aprobar" o "rechazar".' });
    } catch (err) {
        console.error('Error en gestionarSolicitud:', err);
        return res.status(500).json({ status: 500, message: 'Error interno del servidor.' });
    }
}

/**
 * Aplica el reset de contraseña usando el código que RRHH comunicó al usuario.
 * Ruta pública.  POST /reset  body: { username, code, password_nuevo, confirmar }
 */
export async function aplicarReset(req, res) {
    const { username, code, password_nuevo, confirmar } = req.body;

    if (!username || !code || !password_nuevo || !confirmar)
        return res.status(400).json({ status: 400, message: 'Faltan campos obligatorios.' });

    if (password_nuevo !== confirmar)
        return res.status(400).json({ status: 400, message: 'Las contraseñas no coinciden.' });

    if (password_nuevo.length < 6)
        return res.status(400).json({ status: 400, message: 'La contraseña debe tener al menos 6 caracteres.' });

    try {
        await ensureTables();

        const [rows] = await pool.query(
            'SELECT token FROM password_reset WHERE token = ? AND username = ? AND expires_at > NOW() AND usado = 0',
            [code.toUpperCase(), username]
        );

        if (!rows.length)
            return res.status(400).json({ status: 400, message: 'Código inválido o expirado.' });

        const hash = await hashContrasenia(password_nuevo);
        await pool.query('UPDATE usuario SET password = ? WHERE USERNAME = ?', [hash, username]);
        await pool.query('UPDATE password_reset SET usado = 1 WHERE token = ?', [code.toUpperCase()]);

        return res.status(200).json({ status: 200, message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
    } catch (err) {
        console.error('Error en aplicarReset:', err);
        return res.status(500).json({ status: 500, message: 'Error interno del servidor.' });
    }
}
