import crypto from 'crypto';

/**
 * Hashear contraseña (en producción usar bcrypt)
 * Este es un ejemplo simple - usar bcrypt en producción
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + process.env.PASSWORD_SALT)
    .digest('hex');
}

/**
 * Comparar contraseña
 */
export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
