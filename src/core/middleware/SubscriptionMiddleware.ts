// ===== src/core/middleware/SubscriptionMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';

// Extender la interfaz Request para incluir subscription info
declare global {
    namespace Express {
        interface Request {
            subscription?: {
                isActive: boolean;
                planName: string;
                expiresAt: Date;
                canSell: boolean;
            };
        }
    }
}

export interface SubscriptionStatus {
    isActive: boolean;
    planName?: string;
    expiresAt?: Date;
    canSell: boolean;
}

export class SubscriptionMiddleware {
    /**
     * Middleware para verificar que el usuario tiene suscripción Premium activa
     * Debe usarse después de authMiddleware.authenticate
     */
    requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    code: 'AUTHENTICATION_REQUIRED'
                });
                return;
            }

            // Si es admin, permitir acceso
            if (req.user.role === 'memberships') {
                req.subscription = {
                    isActive: true,
                    planName: 'Admin',
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
                    canSell: true
                };
                next();
                return;
            }

            // Verificar suscripción del usuario
            const subscriptionStatus = await this.checkUserSubscription(req.user.userId);

            if (!subscriptionStatus.isActive || !subscriptionStatus.canSell) {
                res.status(403).json({
                    status: 'error',
                    message: 'Premium subscription required to perform this action',
                    code: 'PREMIUM_SUBSCRIPTION_REQUIRED',
                    data: {
                        subscriptionStatus,
                        upgradeUrl: '/api/v1/subscriptions/plans'
                    }
                });
                return;
            }

            req.subscription = {
                isActive: subscriptionStatus.isActive,
                planName: subscriptionStatus.planName ?? '',
                expiresAt: subscriptionStatus.expiresAt ?? new Date(0),
                canSell: subscriptionStatus.canSell
            };
            next();
        } catch (error) {
            console.error('💥 Subscription verification error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error verifying subscription status'
            });
        }
    };

    /**
     * Middleware para agregar información de suscripción sin requerir Premium
     * Útil para endpoints que muestran información diferente según el tipo de usuario
     */
    addSubscriptionInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user) {
                // Si es admin
                if (req.user.role === 'memberships') {
                    req.subscription = {
                        isActive: true,
                        planName: 'Admin',
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        canSell: true
                    };
                } else {
                    // Verificar suscripción del usuario normal
                    const subscriptionStatus = await this.checkUserSubscription(req.user.userId);
                    req.subscription = {
                        isActive: subscriptionStatus.isActive,
                        planName: subscriptionStatus.planName ?? '',
                        expiresAt: subscriptionStatus.expiresAt ?? new Date(0),
                        canSell: subscriptionStatus.canSell
                    };
                }
            }
            next();
        } catch (error) {
            console.error('💥 Error adding subscription info:', error);
            // No bloquear la request, solo continuar sin info de suscripción
            next();
        }
    };

    /**
     * Verifica el estado de suscripción de un usuario
     * TODO: Implementar con el repositorio de suscripciones real
     */
    private async checkUserSubscription(userId: number): Promise<SubscriptionStatus> {
        // TODO: Reemplazar con consulta real a la base de datos
        // Por ahora, simulamos que todos los usuarios no tienen suscripción
        
        try {
            // Esta sería la implementación real:
            // const subscription = await subscriptionRepository.getActiveSubscriptionByUserId(userId);
            // 
            // if (!subscription) {
            //     return { isActive: false, canSell: false };
            // }
            // 
            // return {
            //     isActive: subscription.status === 'active' && subscription.expiresAt > new Date(),
            //     planName: subscription.plan.name,
            //     expiresAt: subscription.expiresAt,
            //     canSell: subscription.status === 'active' && subscription.expiresAt > new Date()
            // };

            // Simulación temporal - REMOVER cuando implementes el repositorio real
            return {
                isActive: false,
                canSell: false
            };
        } catch (error) {
            console.error('Error checking subscription:', error);
            return {
                isActive: false,
                canSell: false
            };
        }
    }

    /**
     * Middleware para verificar límites de uso según el plan
     * Ejemplo: usuarios gratuitos solo pueden crear X productos
     */
    checkUsageLimits = (action: 'create_product' | 'upload_image') => {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        status: 'error',
                        message: 'Authentication required'
                    });
                    return;
                }

                // Si es admin, no hay límites
                if (req.user.role === 'memberships') {
                    next();
                    return;
                }

                // Verificar límites según el tipo de acción
                const hasPermission = await this.checkActionPermission(req.user.userId, action);

                if (!hasPermission) {
                    res.status(403).json({
                        status: 'error',
                        message: 'Usage limit reached. Upgrade to Premium for unlimited access.',
                        code: 'USAGE_LIMIT_REACHED'
                    });
                    return;
                }

                next();
            } catch (error) {
                console.error('💥 Error checking usage limits:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Error verifying usage limits'
                });
            }
        };
    };

    private async checkActionPermission(userId: number, action: string): Promise<boolean> {
        // TODO: Implementar lógica de límites según el plan
        // Por ejemplo:
        // - Usuario gratuito: máximo 5 productos
        // - Usuario Premium: ilimitado
        
        return true; // Temporal
    }
}

// Instancia singleton para usar en toda la aplicación
export const subscriptionMiddleware = new SubscriptionMiddleware();