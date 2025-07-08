// ===== src/feature/subscriptions/domain/SubscriptionPlan.ts =====
export class SubscriptionPlan {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly name: string,
        public readonly description: string | null,
        public readonly price: number,
        public readonly durationDays: number,
        public readonly maxProducts: number, // -1 = ilimitado
        public readonly maxImagesPerProduct: number,
        public readonly features: string[],
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    // Método para obtener respuesta pública
    public toResponse(): SubscriptionPlanResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            price: this.price,
            durationDays: this.durationDays,
            maxProducts: this.maxProducts,
            maxImagesPerProduct: this.maxImagesPerProduct,
            features: this.features,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Verificar si es plan gratuito
    public isFree(): boolean {
        return this.price === 0;
    }

    // Verificar si tiene productos ilimitados
    public hasUnlimitedProducts(): boolean {
        return this.maxProducts === -1;
    }

    // Calcular precio mensual (para planes anuales)
    public getMonthlyPrice(): number {
        if (this.durationDays <= 30) return this.price;
        return this.price / (this.durationDays / 30);
    }

    // Calcular ahorro vs plan mensual
    public calculateSavings(monthlyPlan: SubscriptionPlan): number {
        if (this.durationDays <= 30) return 0;
        const monthsInPlan = this.durationDays / 30;
        const monthlyTotal = monthlyPlan.price * monthsInPlan;
        return monthlyTotal - this.price;
    }

    // Obtener duración en meses
    public getDurationInMonths(): number {
        return Math.round(this.durationDays / 30);
    }
}

export interface SubscriptionPlanResponse {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    price: number;
    durationDays: number;
    maxProducts: number;
    maxImagesPerProduct: number;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSubscriptionPlanData {
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    maxProducts: number;
    maxImagesPerProduct: number;
    features: string[];
    isActive?: boolean;
}

export interface UpdateSubscriptionPlanData {
    name?: string;
    description?: string;
    price?: number;
    durationDays?: number;
    maxProducts?: number;
    maxImagesPerProduct?: number;
    features?: string[];
    isActive?: boolean;
}