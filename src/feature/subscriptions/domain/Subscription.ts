// ===== src/feature/subscriptions/domain/Subscription.ts =====
export class Subscription {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly userId: number,
        public readonly subscriptionPlanId: number,
        public readonly status: SubscriptionStatus,
        public readonly startedAt: Date | null,
        public readonly expiresAt: Date | null,
        public readonly paymentMethod: string | null,
        public readonly paymentReference: string | null,
        public readonly paymentAmount: number | null,
        public readonly autoRenew: boolean,
        public readonly cancelledAt: Date | null,
        public readonly cancellationReason: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    // Método para obtener respuesta pública
    public toResponse(): SubscriptionResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            userId: this.userId,
            subscriptionPlanId: this.subscriptionPlanId,
            status: this.status,
            startedAt: this.startedAt,
            expiresAt: this.expiresAt,
            paymentMethod: this.paymentMethod,
            paymentAmount: this.paymentAmount,
            autoRenew: this.autoRenew,
            cancelledAt: this.cancelledAt,
            cancellationReason: this.cancellationReason,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Verificar si la suscripción está activa
    public isActive(): boolean {
        if (this.status !== 'active') return false;
        if (!this.expiresAt) return false;
        return new Date() < this.expiresAt;
    }

    // Verificar si está próxima a expirar (7 días)
    public isExpiringSoon(days: number = 7): boolean {
        if (!this.isActive() || !this.expiresAt) return false;
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + days);
        return this.expiresAt <= warningDate;
    }

    // Días restantes
    public daysRemaining(): number {
        if (!this.isActive() || !this.expiresAt) return 0;
        const now = new Date();
        const diffTime = this.expiresAt.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface SubscriptionResponse {
    id: number;
    uuid: string;
    userId: number;
    subscriptionPlanId: number;
    status: SubscriptionStatus;
    startedAt: Date | null;
    expiresAt: Date | null;
    paymentMethod: string | null;
    paymentAmount: number | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSubscriptionData {
    userId: number;
    subscriptionPlanId: number;
    paymentMethod?: string;
    paymentReference?: string;
    paymentAmount?: number;
    autoRenew?: boolean;
}

export interface UpdateSubscriptionData {
    status?: SubscriptionStatus;
    expiresAt?: Date;
    autoRenew?: boolean;
    cancellationReason?: string;
}