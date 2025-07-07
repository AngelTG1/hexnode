// ===== src/core/service/JwtService.ts =====
import jwt, { SignOptions, JwtPayload as JwtLibPayload } from 'jsonwebtoken';

export interface TokenPayload {
    userId: number;
    uuid: string;
    email: string;
    role: string;
}

export interface JwtPayload extends TokenPayload {
    iat?: number;
    exp?: number;
}

export class JwtService {
    private readonly jwtSecret: string;
    private readonly defaultExpiresIn: string;

    constructor(jwtSecret?: string, defaultExpiresIn?: string) {
        this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'default_secret_key';
        this.defaultExpiresIn = defaultExpiresIn || process.env.JWT_EXPIRES_IN || '24h';
    }

    /**
     * Genera un token JWT
     * @param payload - Datos del usuario para el token
     * @param expiresIn - Tiempo de expiración (opcional)
     * @returns string - Token JWT generado
     */
    generateToken(payload: TokenPayload, expiresIn?: SignOptions['expiresIn']): string {
        const tokenData = {
            userId: payload.userId,
            uuid: payload.uuid,
            email: payload.email,
            role: payload.role
        };

        const options: SignOptions = { 
            expiresIn: (expiresIn || this.defaultExpiresIn) as SignOptions['expiresIn']
        };

        return jwt.sign(tokenData as object, this.jwtSecret, options);
    }

    /**
     * Verifica y decodifica un token JWT
     * @param token - Token JWT a verificar
     * @returns JwtPayload - Datos decodificados del token
     * @throws Error si el token es inválido o expirado
     */
    verifyToken(token: string): JwtPayload {
        try {
            const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
            return payload;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                const expiredError = new Error('Token has expired');
                expiredError.name = 'TokenExpiredError';
                throw expiredError;
            }
            if (error.name === 'JsonWebTokenError') {
                const invalidError = new Error('Invalid token');
                invalidError.name = 'InvalidTokenError';
                throw invalidError;
            }
            throw error;
        }
    }

    /**
     * Decodifica un token sin verificar (solo para lectura)
     * @param token - Token JWT a decodificar
     * @returns JwtPayload | null - Datos decodificados o null si falla
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Extrae el token del header Authorization
     * @param authHeader - Header Authorization completo
     * @returns string | null - Token extraído o null si no es válido
     */
    extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * Genera un token de refresh (más duración)
     * @param payload - Datos del usuario
     * @returns string - Refresh token
     */
    generateRefreshToken(payload: TokenPayload): string {
        const refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
        return this.generateToken(payload, refreshExpiresIn);
    }

    /**
     * Verifica si un token está próximo a expirar
     * @param token - Token JWT a verificar
     * @param thresholdMinutes - Minutos antes de expiración para considerar "próximo" (default: 5)
     * @returns boolean - True si está próximo a expirar
     */
    isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return false;

            const now = Math.floor(Date.now() / 1000);
            const threshold = thresholdMinutes * 60; // convertir a segundos
            
            return (decoded.exp - now) <= threshold;
        } catch (error) {
            return true; // Si no se puede decodificar, consideramos que está expirado
        }
    }
}

// Instancia singleton para usar en toda la aplicación
export const jwtService = new JwtService();