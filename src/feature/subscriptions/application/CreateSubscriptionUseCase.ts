// ===== src/feature/subscriptions/application/CreateSubscriptionUseCase.ts =====
import { SubscriptionRepository } from '../domain/SubscriptionRepository';
import { UserRepository } from '../../users/domain/UserRepository'; // ✅ NUEVO
import { Subscription } from '../domain/Subscription';
import { 
    SubscriptionPlanNotFoundError,
    ActiveSubscriptionExistsError,
    InactiveSubscriptionPlanError,
    InvalidPaymentDataError
} from '../domain/SubscriptionErrors';

export interface CreateSubscriptionRequest {
    userId: number;
    planUuid: string;
    paymentMethod: string;
    paymentReference?: string;
    autoRenew?: boolean;
}

export interface CreateSubscriptionResponse {
    subscription: Subscription;
    message: string;
    activatedAt: Date;
    expiresAt: Date;
    roleUpdated: boolean; // ✅ NUEVO
}

export class CreateSubscriptionUseCase {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly userRepository: UserRepository // ✅ NUEVO
    ) {}

    async execute(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
        console.log('💎 CreateSubscriptionUseCase - Creating subscription for user:', request.userId);

        

        // Validar que el usuario no tenga una suscripción activa
        const hasActiveSubscription = await this.subscriptionRepository.hasActiveSubscription(request.userId);
        if (hasActiveSubscription) {
            throw new ActiveSubscriptionExistsError();
        }

        // Buscar el plan de suscripción
        const plan = await this.subscriptionRepository.findPlanByUuid(request.planUuid);
        if (!plan) {
            throw new SubscriptionPlanNotFoundError(request.planUuid);
        }

        // Verificar que el plan esté activo
        if (!plan.isActive) {
            throw new InactiveSubscriptionPlanError(plan.name);
        }

        // Validar datos de pago
        this.validatePaymentData(request, plan);

        // Calcular fechas
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (plan.durationDays * 24 * 60 * 60 * 1000));

        // Crear la suscripción
        const subscriptionData = {
            userId: request.userId,
            subscriptionPlanId: plan.id,
            paymentMethod: request.paymentMethod,
            paymentReference: request.paymentReference,
            paymentAmount: plan.price,
            autoRenew: request.autoRenew || false
        };

        const subscription = await this.subscriptionRepository.createSubscription(subscriptionData);

        // Activar la suscripción inmediatamente (en un caso real, esto dependería del pago)
        const activatedSubscription = await this.subscriptionRepository.updateSubscription(
            subscription.uuid,
            {
                status: 'active',
                expiresAt: expiresAt
            }
        );

        if (!activatedSubscription) {
            throw new Error('Failed to activate subscription');
        }

        // ✅ NUEVO: Actualizar el rol del usuario a 'memberships'
        let roleUpdated = false;
        try {
            roleUpdated = await this.userRepository.updateUserRole(request.userId, 'memberships');
            if (roleUpdated) {
                console.log('🎉 User role updated to memberships successfully');
            } else {
                console.warn('⚠️ Failed to update user role to memberships');
            }
        } catch (error) {
            console.error('💥 Error updating user role:', error);
            // No fallar la suscripción por esto, pero logearlo
        }

        console.log('✅ Subscription created and activated:', activatedSubscription.uuid);

        return {
            subscription: activatedSubscription,
            message: `Successfully subscribed to ${plan.name}. You now have premium access!`,
            activatedAt: now,
            expiresAt: expiresAt,
            roleUpdated // ✅ NUEVO
        };
    }

    private validatePaymentData(request: CreateSubscriptionRequest, plan: any): void {
        // Para planes gratuitos, no se requiere método de pago
        if (plan.isFree()) {
            return;
        }

        // Para planes de pago, validar método de pago
        if (!request.paymentMethod?.trim()) {
            throw new InvalidPaymentDataError('payment method is required for paid plans');
        }

        // Validar métodos de pago permitidos
        const allowedMethods = ['stripe', 'paypal', 'credit_card', 'manual'];
        if (!allowedMethods.includes(request.paymentMethod)) {
            throw new InvalidPaymentDataError(`payment method must be one of: ${allowedMethods.join(', ')}`);
        }

        // Para métodos automáticos, requerir referencia
        if (['stripe', 'paypal'].includes(request.paymentMethod) && !request.paymentReference) {
            throw new InvalidPaymentDataError('payment reference is required for automated payment methods');
        }
    }

    
}