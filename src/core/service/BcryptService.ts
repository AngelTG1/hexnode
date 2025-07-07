// ===== src/core/service/BcryptService.ts =====
import bcrypt from 'bcrypt';

export class BcryptService {
    private readonly defaultSaltRounds: number;

    constructor(saltRounds?: number) {
        this.defaultSaltRounds = saltRounds || parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    }

    /**
     * Encripta una contraseña usando bcrypt
     * @param password - Contraseña en texto plano
     * @param saltRounds - Número de rondas (opcional, usa el default si no se proporciona)
     * @returns Promise<string> - Contraseña encriptada
     */
    async hashPassword(password: string, saltRounds?: number): Promise<string> {
        const rounds = saltRounds || this.defaultSaltRounds;
        return await bcrypt.hash(password, rounds);
    }

    /**
     * Compara una contraseña en texto plano con su hash
     * @param password - Contraseña en texto plano
     * @param hashedPassword - Contraseña encriptada
     * @returns Promise<boolean> - True si coinciden, false si no
     */
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Genera un salt específico (uso avanzado)
     * @param rounds - Número de rondas
     * @returns Promise<string> - Salt generado
     */
    async generateSalt(rounds?: number): Promise<string> {
        const saltRounds = rounds || this.defaultSaltRounds;
        return await bcrypt.genSalt(saltRounds);
    }

    /**
     * Encripta usando un salt específico (uso avanzado)
     * @param password - Contraseña en texto plano
     * @param salt - Salt específico
     * @returns Promise<string> - Contraseña encriptada
     */
    async hashPasswordWithSalt(password: string, salt: string): Promise<string> {
        return await bcrypt.hash(password, salt);
    }
}

// Instancia singleton para usar en toda la aplicación
export const bcryptService = new BcryptService();