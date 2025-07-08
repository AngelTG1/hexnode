// ===== src/feature/subscriptions/application/GetSubscriptionPlansUseCase.ts =====
import { SubscriptionRepository } from '../domain/SubscriptionRepository';
import { SubscriptionPlan } from '../domain/SubscriptionPlan';

export interface GetSubscriptionPlansResponse {
    plans: SubscriptionPlan[];
    recommendations: {
        mostPopular?: string; // UUID del plan más popular
        bestValue?: string;   // UUID del plan con mejor valor
        free?: string;        // UUID del plan gratuito
    };
}

export class GetSubscriptionPlansUseCase {
    constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

    async execute(): Promise<GetSubscriptionPlansResponse> {
        console.log('📋 GetSubscriptionPlansUseCase - Fetching available plans');

        // Obtener todos los planes activos
        const plans = await this.subscriptionRepository.findAllPlans();
        
        // Generar recomendaciones
        const recommendations = this.generateRecommendations(plans);

        console.log(`✅ Found ${plans.length} subscription plans`);

        return {
            plans,
            recommendations
        };
    }

    private generateRecommendations(plans: SubscriptionPlan[]) {
        const recommendations: any = {};

        // Plan gratuito
        const freePlan = plans.find(plan => plan.isFree());
        if (freePlan) {
            recommendations.free = freePlan.uuid;
        }

        // Plan con mejor valor (mayor duración con descuento)
        const paidPlans = plans.filter(plan => !plan.isFree());
        if (paidPlans.length > 1) {
            // Buscar el plan anual (más días por menos precio mensual)
            const bestValue = paidPlans.reduce((best, current) => {
                const bestMonthlyPrice = best.getMonthlyPrice();
                const currentMonthlyPrice = current.getMonthlyPrice();
                
                return currentMonthlyPrice < bestMonthlyPrice ? current : best;
            });
            
            recommendations.bestValue = bestValue.uuid;
        }

        // Plan más popular (por ahora el plan mensual premium)
        const monthlyPremium = paidPlans.find(plan => 
            plan.name.toLowerCase().includes('monthly') && 
            plan.name.toLowerCase().includes('premium')
        );
        if (monthlyPremium) {
            recommendations.mostPopular = monthlyPremium.uuid;
        }

        return recommendations;
    }
}