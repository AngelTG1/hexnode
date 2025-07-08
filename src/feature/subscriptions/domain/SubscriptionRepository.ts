// ===== src/feature/subscriptions/domain/SubscriptionRepository.ts =====
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData } from './Subscription';
import { SubscriptionPlan, CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from './SubscriptionPlan';

export interface SubscriptionRepository {
    findExpiredSubscriptions(): unknown;
    // ===== SUBSCRIPTION PLANS =====
    
    // Encontrar todos los planes activos
    findAllPlans(): Promise<SubscriptionPlan[]>;

    findExpiredSubscriptions(): Promise<Subscription[]>;
    
    // Encontrar plan por UUID
    findPlanByUuid(uuid: string): Promise<SubscriptionPlan | null>;
    
    // Encontrar plan por ID
    findPlanById(id: number): Promise<SubscriptionPlan | null>;
    
    // Crear plan de suscripción (solo admins)
    createPlan(planData: CreateSubscriptionPlanData): Promise<SubscriptionPlan>;
    
    // Actualizar plan (solo admins)
    updatePlan(uuid: string, planData: UpdateSubscriptionPlanData): Promise<SubscriptionPlan | null>;
    
    // Eliminar/desactivar plan (solo admins)
    deactivatePlan(uuid: string): Promise<boolean>;
    
    // ===== USER SUBSCRIPTIONS =====
    
    // Encontrar suscripción activa del usuario
    findActiveSubscriptionByUserId(userId: number): Promise<Subscription | null>;
    
    // Encontrar todas las suscripciones del usuario (historial)
    findSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
    
    // Encontrar suscripción por UUID
    findSubscriptionByUuid(uuid: string): Promise<Subscription | null>;
    
    // Crear nueva suscripción
    createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription>;
    
    // Actualizar suscripción
    updateSubscription(uuid: string, subscriptionData: UpdateSubscriptionData): Promise<Subscription | null>;
    
    // Cancelar suscripción
    cancelSubscription(uuid: string, reason: string): Promise<boolean>;
    
    // Verificar si el usuario tiene suscripción activa
    hasActiveSubscription(userId: number): Promise<boolean>;
    
    // Obtener suscripción con información del plan
    getSubscriptionWithPlan(uuid: string): Promise<{
        subscription: Subscription;
        plan: SubscriptionPlan;
    } | null>;
    
    // Obtener suscripciones que expiran pronto
    findExpiringSoon(days: number): Promise<Subscription[]>;
    
    // Obtener estadísticas de suscripciones (para admin)
    getSubscriptionStats(): Promise<{
        totalSubscriptions: number;
        activeSubscriptions: number;
        expiredSubscriptions: number;
        cancelledSubscriptions: number;
        totalRevenue: number;
        monthlyRevenue: number;
    }>;
}