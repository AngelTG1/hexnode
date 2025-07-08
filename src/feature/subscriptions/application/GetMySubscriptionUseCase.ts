// ===== src/feature/subscriptions/application/GetMySubscriptionUseCase.ts =====
import { SubscriptionRepository } from '../domain/SubscriptionRepository';
import { Subscription } from '../domain/Subscription';
import { SubscriptionPlan } from '../domain/SubscriptionPlan';

export interface GetMySubscriptionResponse {
    hasActiveSubscription: boolean;
    currentSubscription?: {
        subscription: Subscription;
        plan: SubscriptionPlan;
        status: {
            isActive: boolean;
            isExpiringSoon: boolean;
            daysRemaining: number;
        };
    };
    subscriptionHistory: Subscription[];
    availableActions: string[];
}

export class GetMySubscriptionUseCase {
    constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

    async execute(userId: number): Promise<GetMySubscriptionResponse> {
        console.log('👤 GetMySubscriptionUseCase - Getting subscription for user:', userId);

        // Buscar suscripción activa
        const activeSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
        
        // Buscar historial de suscripciones
        const subscriptionHistory = await this.subscriptionRepository.findSubscriptionsByUserId(userId);

        let currentSubscription;
        if (activeSubscription) {
            // Obtener información del plan
            const subscriptionWithPlan = await this.subscriptionRepository.getSubscriptionWithPlan(activeSubscription.uuid);
            
            if (subscriptionWithPlan) {
                currentSubscription = {
                    subscription: subscriptionWithPlan.subscription,
                    plan: subscriptionWithPlan.plan,
                    status: {
                        isActive: subscriptionWithPlan.subscription.isActive(),
                        isExpiringSoon: subscriptionWithPlan.subscription.isExpiringSoon(),
                        daysRemaining: subscriptionWithPlan.subscription.daysRemaining()
                    }
                };
            }
        }

        // Determinar acciones disponibles
        const availableActions = this.getAvailableActions(activeSubscription);

        console.log(`✅ User subscription status: ${activeSubscription ? 'Active' : 'No active subscription'}`);

        return {
            hasActiveSubscription: !!activeSubscription,
            currentSubscription,
            subscriptionHistory,
            availableActions
        };
    }

    private getAvailableActions(activeSubscription: Subscription | null): string[] {
        const actions: string[] = [];

        if (!activeSubscription) {
            actions.push('subscribe');
            actions.push('view_plans');
        } else {
            if (activeSubscription.isActive()) {
                actions.push('cancel_subscription');
                actions.push('update_payment_method');
                
                if (activeSubscription.autoRenew) {
                    actions.push('disable_auto_renew');
                } else {
                    actions.push('enable_auto_renew');
                }

                if (activeSubscription.isExpiringSoon()) {
                    actions.push('renew_subscription');
                }
            } else {
                actions.push('reactivate_subscription');
                actions.push('subscribe_new_plan');
            }

            actions.push('view_subscription_history');
            actions.push('download_invoices');
        }

        return actions;
    }
}