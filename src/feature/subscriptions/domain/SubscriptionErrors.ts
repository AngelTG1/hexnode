// ===== src/feature/subscriptions/domain/SubscriptionErrors.ts =====
export class SubscriptionError extends Error {
    details: { details: any; } | undefined;
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'SubscriptionError';
    }
}

export class SubscriptionPlanNotFoundError extends SubscriptionError {
    constructor(identifier: string) {
        super(`Subscription plan with identifier ${identifier} not found`, 'SUBSCRIPTION_PLAN_NOT_FOUND');
    }
}

export class SubscriptionNotFoundError extends SubscriptionError {
    constructor(identifier: string) {
        super(`Subscription with identifier ${identifier} not found`, 'SUBSCRIPTION_NOT_FOUND');
    }
}

export class ActiveSubscriptionExistsError extends SubscriptionError {
    constructor() {
        super('User already has an active subscription', 'ACTIVE_SUBSCRIPTION_EXISTS');
    }
}

export class InactiveSubscriptionPlanError extends SubscriptionError {
    constructor(planName: string) {
        super(`Subscription plan ${planName} is not available`, 'INACTIVE_SUBSCRIPTION_PLAN');
    }
}

export class InvalidPaymentDataError extends SubscriptionError {
    constructor(field: string) {
        super(`Invalid payment data: ${field}`, 'INVALID_PAYMENT_DATA');
    }
}

export class SubscriptionCancellationError extends SubscriptionError {
    constructor(reason: string) {
        super(`Cannot cancel subscription: ${reason}`, 'SUBSCRIPTION_CANCELLATION_ERROR');
    }
}

export class InvalidSubscriptionStatusError extends SubscriptionError {
    constructor(currentStatus: string, targetStatus: string) {
        super(`Cannot change subscription status from ${currentStatus} to ${targetStatus}`, 'INVALID_SUBSCRIPTION_STATUS');
    }
}

export class PaymentProcessingError extends SubscriptionError {
    constructor(message: string) {
        super(`Payment processing failed: ${message}`, 'PAYMENT_PROCESSING_ERROR');
    }
}