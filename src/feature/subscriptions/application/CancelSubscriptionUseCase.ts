// ===== src/feature/subscriptions/application/CancelSubscriptionUseCase.ts =====
import { SubscriptionRepository } from '../domain/SubscriptionRepository';
import { UserRepository } from '../../users/domain/UserRepository'; // ✅ NUEVO
import { 
    SubscriptionNotFoundError,
    SubscriptionCancellationError,
    InvalidSubscriptionStatusError
} from '../domain/SubscriptionErrors';

export interface CancelSubscriptionRequest {
    userId: number;
    subscriptionUuid: string;
    reason: string;
    immediate?: boolean; // Si true, cancela inmediatamente; si false, cancela al final del periodo
}

export interface CancelSubscriptionResponse {
    success: boolean;
    message: string;
    effectiveDate: Date;
    refundAmount?: number;
    roleReverted?: boolean; // ✅ NUEVO
}

export class CancelSubscriptionUseCase {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly userRepository: UserRepository // ✅ NUEVO
    ) {}

    async execute(request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
        console.log('❌ CancelSubscriptionUseCase - Cancelling subscription:', request.subscriptionUuid);

        // Buscar la suscripción
        const subscription = await this.subscriptionRepository.findSubscriptionByUuid(request.subscriptionUuid);
        if (!subscription) {
            throw new SubscriptionNotFoundError(request.subscriptionUuid);
        }

        // Verificar que la suscripción pertenece al usuario
        if (subscription.userId !== request.userId) {
            throw new SubscriptionNotFoundError(request.subscriptionUuid);
        }

        // Verificar que la suscripción se puede cancelar
        if (subscription.status === 'cancelled') {
            throw new SubscriptionCancellationError('Subscription is already cancelled');
        }

        if (subscription.status === 'expired') {
            throw new SubscriptionCancellationError('Cannot cancel an expired subscription');
        }

        // Determinar fecha efectiva de cancelación
        let effectiveDate: Date;
        let newStatus: 'cancelled' | 'active' = 'cancelled';
        let shouldRevertRole = false;

        if (request.immediate) {
            // Cancelación inmediata
            effectiveDate = new Date();
            newStatus = 'cancelled';
            shouldRevertRole = true; // ✅ Revertir rol inmediatamente
        } else {
            // Cancelar al final del periodo de facturación
            effectiveDate = subscription.expiresAt || new Date();
            newStatus = 'active'; // Mantener activo hasta que expire
            shouldRevertRole = false; // ✅ No revertir rol aún
        }

        // Actualizar la suscripción
        const updatedSubscription = await this.subscriptionRepository.updateSubscription(
            subscription.uuid,
            {
                status: newStatus,
                autoRenew: false // Siempre deshabilitar auto-renovación
            }
        );

        if (!updatedSubscription) {
            throw new Error('Failed to update subscription');
        }

        // Registrar la cancelación
        const cancelled = await this.subscriptionRepository.cancelSubscription(
            subscription.uuid,
            request.reason
        );

        if (!cancelled) {
            throw new Error('Failed to cancel subscription');
        }

        // ✅ NUEVO: Revertir rol del usuario si es cancelación inmediata
        let roleReverted = false;
        if (shouldRevertRole) {
            try {
                roleReverted = await this.userRepository.updateUserRole(request.userId, 'Cliente');
                if (roleReverted) {
                    console.log('🔄 User role reverted to Cliente successfully');
                } else {
                    console.warn('⚠️ Failed to revert user role to Cliente');
                }
            } catch (error) {
                console.error('💥 Error reverting user role:', error);
                // No fallar la cancelación por esto
            }
        }

        // Calcular reembolso (si aplica)
        let refundAmount: number | undefined;
        if (request.immediate && subscription.paymentAmount) {
            refundAmount = this.calculateRefund(subscription, effectiveDate);
        }

        const message = request.immediate 
            ? 'Subscription cancelled immediately. Premium access removed.'
            : `Subscription will be cancelled on ${effectiveDate.toDateString()}. You will keep premium access until then.`;

        console.log('✅ Subscription cancelled successfully');

        return {
            success: true,
            message,
            effectiveDate,
            refundAmount,
            roleReverted // ✅ NUEVO
        };
    }

    private calculateRefund(subscription: any, cancellationDate: Date): number {
        // Lógica simple de reembolso proporcional
        if (!subscription.expiresAt || !subscription.paymentAmount) {
            return 0;
        }

        const totalDays = Math.ceil(
            (subscription.expiresAt.getTime() - subscription.startedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const remainingDays = Math.ceil(
            (subscription.expiresAt.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (remainingDays <= 0) return 0;

        const refundPercentage = remainingDays / totalDays;
        return Math.round(subscription.paymentAmount * refundPercentage * 100) / 100;
    }
}