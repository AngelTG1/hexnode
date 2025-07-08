// ===== src/feature/subscriptions/application/SubscriptionExpiryService.ts =====
import { SubscriptionRepository } from '../domain/SubscriptionRepository';
import { UserRepository } from '../../users/domain/UserRepository';

export class SubscriptionExpiryService {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly userRepository: UserRepository
    ) {}

    // Ejecutar cada día para verificar suscripciones expiradas
    async processExpiredSubscriptions(): Promise<void> {
        console.log('⏰ SubscriptionExpiryService - Processing expired subscriptions');

        try {
            // Buscar suscripciones activas que ya expiraron
            const sql = `
                SELECT id, uuid, user_id, subscription_plan_id, status, expires_at
                FROM user_subscriptions 
                WHERE status = 'active' AND expires_at <= NOW()
            `;

            // Aquí necesitarías acceder directamente a la base de datos
            // o crear un método en el repository para esto
            const expiredSubscriptions = await this.subscriptionRepository.findExpiredSubscriptions() as any[];

            console.log(`📊 Found ${expiredSubscriptions.length} expired subscriptions`);

            for (const subscription of expiredSubscriptions) {
                await this.handleExpiredSubscription(subscription);
            }

            console.log('✅ Finished processing expired subscriptions');
        } catch (error) {
            console.error('💥 Error processing expired subscriptions:', error);
        }
    }

    // Procesar suscripción individual expirada
    private async handleExpiredSubscription(subscription: any): Promise<void> {
        console.log(`⏰ Processing expired subscription: ${subscription.uuid}`);

        try {
            // 1. Actualizar estado de la suscripción a 'expired'
            await this.subscriptionRepository.updateSubscription(subscription.uuid, {
                status: 'expired'
            });

            // 2. Revertir rol del usuario a 'Cliente'
            const roleReverted = await this.userRepository.updateUserRole(subscription.user_id, 'Cliente');

            if (roleReverted) {
                console.log(`✅ User ${subscription.user_id} role reverted to Cliente (subscription expired)`);
            } else {
                console.warn(`⚠️ Failed to revert role for user ${subscription.user_id}`);
            }

            // 3. Aquí podrías enviar notificación al usuario
            // await this.notificationService.sendSubscriptionExpiredEmail(subscription.user_id);

        } catch (error) {
            console.error(`💥 Error handling expired subscription ${subscription.uuid}:`, error);
        }
    }

    // Notificar suscripciones que expiran pronto
    async notifyExpiringSoon(days: number = 7): Promise<void> {
        console.log(`📧 SubscriptionExpiryService - Notifying subscriptions expiring in ${days} days`);

        try {
            const expiringSoon = await this.subscriptionRepository.findExpiringSoon(days);
            
            console.log(`📊 Found ${expiringSoon.length} subscriptions expiring soon`);

            for (const subscription of expiringSoon) {
                // Aquí enviarías notificaciones
                console.log(`📧 Would notify user ${subscription.userId} about expiring subscription`);
            }

        } catch (error) {
            console.error('💥 Error notifying expiring subscriptions:', error);
        }
    }
}