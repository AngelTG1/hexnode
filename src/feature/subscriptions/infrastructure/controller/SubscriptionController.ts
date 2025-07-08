// ===== src/feature/subscriptions/infrastructure/controllers/SubscriptionController.ts =====
import { Request, Response } from 'express';
import { GetSubscriptionPlansUseCase } from '../../application/GetSubscriptionPlansUseCase';
import { CreateSubscriptionUseCase } from '../../application/CreateSubscriptionUseCase';
import { GetMySubscriptionUseCase } from '../../application/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../../application/CancelSubscriptionUseCase';
import { SubscriptionError } from '../../domain/SubscriptionErrors';

export class SubscriptionController {
    constructor(
        private readonly getSubscriptionPlansUseCase: GetSubscriptionPlansUseCase,
        private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
        private readonly getMySubscriptionUseCase: GetMySubscriptionUseCase,
        private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase
    ) {}

    // GET /api/v1/subscriptions/plans - Ver planes disponibles (público)
    getPlans = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📋 SubscriptionController - Get subscription plans request');

            const result = await this.getSubscriptionPlansUseCase.execute();

            res.status(200).json({
                status: 'success',
                data: {
                    plans: result.plans.map(plan => plan.toResponse()),
                    recommendations: result.recommendations
                }
            });
        } catch (error) {
            console.error('💥 Error in getPlans:', error);
            this.handleError(error, res);
        }
    };

    // POST /api/v1/subscriptions/subscribe - Suscribirse a un plan (autenticado)
    subscribe = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('💎 SubscriptionController - Subscribe request for user:', req.user!.userId);

            const subscriptionRequest = {
                userId: req.user!.userId,
                planUuid: req.body.planUuid,
                paymentMethod: req.body.paymentMethod,
                paymentReference: req.body.paymentReference,
                autoRenew: req.body.autoRenew
            };

            const result = await this.createSubscriptionUseCase.execute(subscriptionRequest);

            res.status(201).json({
                status: 'success',
                message: result.message,
                data: {
                    subscription: result.subscription.toResponse(),
                    activatedAt: result.activatedAt,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            console.error('💥 Error in subscribe:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/subscriptions/my-subscription - Ver mi suscripción (autenticado)
    getMySubscription = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('👤 SubscriptionController - Get my subscription request for user:', req.user!.userId);

            const result = await this.getMySubscriptionUseCase.execute(req.user!.userId);

            res.status(200).json({
                status: 'success',
                data: {
                    hasActiveSubscription: result.hasActiveSubscription,
                    currentSubscription: result.currentSubscription ? {
                        subscription: result.currentSubscription.subscription.toResponse(),
                        plan: result.currentSubscription.plan.toResponse(),
                        status: result.currentSubscription.status
                    } : null,
                    subscriptionHistory: result.subscriptionHistory.map(sub => sub.toResponse()),
                    availableActions: result.availableActions
                }
            });
        } catch (error) {
            console.error('💥 Error in getMySubscription:', error);
            this.handleError(error, res);
        }
    };

    // POST /api/v1/subscriptions/cancel - Cancelar suscripción (autenticado)
    cancelSubscription = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('❌ SubscriptionController - Cancel subscription request for user:', req.user!.userId);

            const cancelRequest = {
                userId: req.user!.userId,
                subscriptionUuid: req.body.subscriptionUuid,
                reason: req.body.reason || 'User requested cancellation',
                immediate: req.body.immediate || false
            };

            const result = await this.cancelSubscriptionUseCase.execute(cancelRequest);

            res.status(200).json({
                status: 'success',
                message: result.message,
                data: {
                    effectiveDate: result.effectiveDate,
                    refundAmount: result.refundAmount
                }
            });
        } catch (error) {
            console.error('💥 Error in cancelSubscription:', error);
            this.handleError(error, res);
        }
    };

    // PUT /api/v1/subscriptions/auto-renew - Cambiar auto-renovación (autenticado)
    updateAutoRenew = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('🔄 SubscriptionController - Update auto-renew for user:', req.user!.userId);

            // TODO: Implementar caso de uso para actualizar auto-renovación
            res.status(501).json({
                status: 'error',
                message: 'Feature not implemented yet'
            });
        } catch (error) {
            console.error('💥 Error in updateAutoRenew:', error);
            this.handleError(error, res);
        }
    };

    // GET /api/v1/subscriptions/stats - Estadísticas (solo admins)
    getSubscriptionStats = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('📊 SubscriptionController - Get subscription stats (admin)');

            // Verificar que es admin
            if (req.user!.role !== 'memberships') {
                res.status(403).json({
                    status: 'error',
                    message: 'Admin access required',
                    code: 'ADMIN_REQUIRED'
                });
                return;
            }

            // TODO: Implementar caso de uso para estadísticas
            res.status(501).json({
                status: 'error',
                message: 'Feature not implemented yet'
            });
        } catch (error) {
            console.error('💥 Error in getSubscriptionStats:', error);
            this.handleError(error, res);
        }
    };

    private handleError(error: any, res: Response): void {
        if (error instanceof SubscriptionError) {
            const statusCode = this.getStatusCodeForError(error.code);
            res.status(statusCode).json({
                status: 'error',
                message: error.message,
                code: error.code,
                ...(error.details && { details: error.details })
            });
        } else {
            console.error('💥 Unexpected error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    private getStatusCodeForError(errorCode: string): number {
        const statusCodeMap: Record<string, number> = {
            // Errores de validación (400)
            'INVALID_PLAN': 400,
            'INVALID_PAYMENT_METHOD': 400,
            'INVALID_PAYMENT_REFERENCE': 400,
            'INVALID_SUBSCRIPTION_UUID': 400,
            'INVALID_USER_ID': 400,
            'MISSING_REQUIRED_FIELDS': 400,
            'INVALID_AUTO_RENEW_VALUE': 400,
            
            // Errores de autenticación/autorización (401/403)
            'USER_NOT_AUTHENTICATED': 401,
            'ADMIN_REQUIRED': 403,
            'INSUFFICIENT_PERMISSIONS': 403,
            
            // Errores de recursos no encontrados (404)
            'PLAN_NOT_FOUND': 404,
            'SUBSCRIPTION_NOT_FOUND': 404,
            'USER_NOT_FOUND': 404,
            
            // Errores de conflicto/estado (409)
            'ACTIVE_SUBSCRIPTION_EXISTS': 409,
            'SUBSCRIPTION_ALREADY_CANCELLED': 409,
            'SUBSCRIPTION_ALREADY_EXPIRED': 409,
            'PAYMENT_ALREADY_PROCESSED': 409,
            'INVALID_SUBSCRIPTION_STATE': 409,
            
            // Errores de procesamiento de pagos (422)
            'PAYMENT_PROCESSING_FAILED': 422,
            'PAYMENT_DECLINED': 422,
            'INSUFFICIENT_FUNDS': 422,
            'PAYMENT_METHOD_EXPIRED': 422,
            'REFUND_PROCESSING_FAILED': 422,
            
            // Errores de límites/cuota (429)
            'SUBSCRIPTION_LIMIT_EXCEEDED': 429,
            'RATE_LIMIT_EXCEEDED': 429,
            
            // Errores de servicios externos (502/503)
            'PAYMENT_GATEWAY_ERROR': 502,
            'EXTERNAL_SERVICE_ERROR': 502,
            'SERVICE_UNAVAILABLE': 503,
            
            // Errores de tiempo (408)
            'PAYMENT_TIMEOUT': 408,
            'PROCESSING_TIMEOUT': 408,
            
            // Errores de datos (422)
            'INVALID_SUBSCRIPTION_DATA': 422,
            'DATA_INTEGRITY_ERROR': 422,
            
            // Errores de negocio (422)
            'PLAN_NOT_AVAILABLE': 422,
            'SUBSCRIPTION_EXPIRED': 422,
            'CANCELLATION_NOT_ALLOWED': 422,
            'REFUND_NOT_ALLOWED': 422,
            
            // Error por defecto
            'INTERNAL_ERROR': 500,
            'UNKNOWN_ERROR': 500
        };

        return statusCodeMap[errorCode] || 500;
    }
}