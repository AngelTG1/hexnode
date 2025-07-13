// ===== src/feature/cart/domain/CartErrors.ts =====

export class CartError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'CartError';
    }
}

export class CartNotFoundError extends CartError {
    constructor(identifier: string) {
        super(`Cart with identifier ${identifier} not found`, 'CART_NOT_FOUND');
    }
}

export class CartItemNotFoundError extends CartError {
    constructor(itemId: string) {
        super(`Cart item with ID ${itemId} not found`, 'CART_ITEM_NOT_FOUND');
    }
}

export class ProductNotFoundError extends CartError {
    constructor(productId: number) {
        super(`Product with ID ${productId} not found`, 'PRODUCT_NOT_FOUND');
    }
}

export class InsufficientStockError extends CartError {
    constructor(productName: string, requested: number, available: number) {
        super(
            `Insufficient stock for ${productName}. Requested: ${requested}, Available: ${available}`, 
            'INSUFFICIENT_STOCK'
        );
    }
}

export class InvalidQuantityError extends CartError {
    constructor(quantity: number) {
        super(`Invalid quantity: ${quantity}. Quantity must be greater than 0`, 'INVALID_QUANTITY');
    }
}

export class ProductAlreadyInCartError extends CartError {
    constructor(productName: string) {
        super(`Product ${productName} is already in cart. Use update quantity instead.`, 'PRODUCT_ALREADY_IN_CART');
    }
}

export class CartLimitExceededError extends CartError {
    constructor(limit: number) {
        super(`Cart limit exceeded. Maximum ${limit} different products allowed`, 'CART_LIMIT_EXCEEDED');
    }
}

export class UnauthorizedCartActionError extends CartError {
    constructor(action: string) {
        super(`Unauthorized to perform cart action: ${action}`, 'UNAUTHORIZED_CART_ACTION');
    }
}

export class InvalidCartStatusError extends CartError {
    constructor(currentStatus: string, action: string) {
        super(
            `Cannot perform ${action} on cart with status ${currentStatus}`, 
            'INVALID_CART_STATUS'
        );
    }
}