import crypto from "crypto";
/**
 * Hashea la contraseña del usuario.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param password
 * @returns {Promise<unknown>}
 */
export function hashContrasenia(password) {
    return new Promise((resolve, reject) => {
        // Generamos un 'salt' único para este usuario
        const salt = crypto.randomBytes(16).toString('hex');

        // Scrypt hace que el proceso sea computacionalmente costoso
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            // Guardamos el salt y el hash juntos
            resolve(salt + ":" + derivedKey.toString('hex'));
        });
    });
}

/**
 * Verifica el hash de la contraseña.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param password
 * @param storedValue
 * @returns {Promise<unknown>}
 */
export function verificarContrasenia(password, storedValue) {
    return new Promise((resolve, reject) => {
        const [salt, hash] = storedValue.split(":");

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            // Comparamos el nuevo hash con el guardado
            resolve(hash === derivedKey.toString('hex'));
        });
    });
}