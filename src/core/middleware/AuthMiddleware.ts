// ===== src/core/middleware/AuthMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload, TokenPayload } from '../service/JwtService';

// Extender la interfaz Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                uuid: string;
                email: string;
                role: string;
            };
        }
    }
}

export class AuthMiddleware {
    /**
     * Middleware para autenticar requests
     * Verifica que el token JWT sea válido
     */
    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authorization token required',
                    code: 'AUTHORIZATION_REQUIRED'
                });
                return;
            }

            const token = jwtService.extractTokenFromHeader(authHeader);
            if (!token) {
                res.status(401).json({
                    status: 'error',
                    message: 'Invalid authorization format',
                    code: 'INVALID_AUTH_FORMAT'
                });
                return;
            }
            
            const payload = jwtService.verifyToken(token);
            
            req.user = {
                userId: payload.userId,
                uuid: payload.uuid,
                email: payload.email,
                role: payload.role
            };

            next();
        } catch (error: any) {
            console.error('💥 Authentication error:', error);
            
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({
                    status: 'error',
                    message: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
                return;
            }

            res.status(401).json({
                status: 'error',
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
    };

    /**
     * Middleware para autorizar por roles
     * Debe usarse después de authenticate
     */
    authorize = (roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    code: 'AUTHENTICATION_REQUIRED'
                });
                return;
            }

            if (!roles.includes(req.user.role)) {
                res.status(403).json({
                    status: 'error',
                    message: 'Insufficient permissions',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
                return;
            }

            next();
        };
    };

    /**
     * Middleware para verificar si el token está próximo a expirar
     * Agrega información adicional a la respuesta
     */
    checkTokenExpiration = (req: Request, res: Response, next: NextFunction): void => {
        if (req.user) {
            const authHeader = req.headers.authorization;
            const token = jwtService.extractTokenFromHeader(authHeader);
            
            if (token && jwtService.isTokenExpiringSoon(token)) {
                // Agregar header para avisar al frontend que renueve el token
                res.setHeader('X-Token-Expiring-Soon', 'true');
            }
        }
        next();
    };

    /**
     * Método público para validar tokens (para casos de uso)
     */
    validateToken(token: string): JwtPayload {
        return jwtService.verifyToken(token);
    }

    /**
     * Método para generar tokens (para casos de uso)
     */
    generateToken(payload: TokenPayload, expiresIn?: import('jsonwebtoken').SignOptions['expiresIn']): string {
        return jwtService.generateToken(payload, expiresIn);
    }
}

// Instancia singleton para usar en toda la aplicación
export const authMiddleware = new AuthMiddleware();