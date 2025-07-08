export class ProductError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'ProductError';
    }
}

export class ProductNotFoundError extends ProductError {
    constructor(identifier: string) {
        super(`Product with identifier ${identifier} not found`, 'PRODUCT_NOT_FOUND');
    }
}

export class InvalidProductDataError extends ProductError {
    constructor(field: string, reason: string) {
        super(`Invalid product data for field ${field}: ${reason}`, 'INVALID_PRODUCT_DATA');
    }
}

export class InsufficientStockError extends ProductError {
    constructor(requested: number, available: number) {
        super(`Insufficient stock. Requested: ${requested}, Available: ${available}`, 'INSUFFICIENT_STOCK');
    }
}

export class UnauthorizedProductActionError extends ProductError {
    constructor(action: string) {
        super(`Unauthorized to perform action: ${action}`, 'UNAUTHORIZED_PRODUCT_ACTION');
    }
}

export class ProductRequiredFieldError extends ProductError {
    constructor(field: string) {
        super(`Required field missing: ${field}`, 'PRODUCT_REQUIRED_FIELD_MISSING');
    }
}

export class InvalidPriceError extends ProductError {
    constructor(price: number) {
        super(`Invalid price: ${price}. Price must be greater than 0`, 'INVALID_PRICE');
    }
}

export class InvalidStockQuantityError extends ProductError {
    constructor(quantity: number) {
        super(`Invalid stock quantity: ${quantity}. Quantity must be 0 or greater`, 'INVALID_STOCK_QUANTITY');
    }
}

export class ProductNameTooLongError extends ProductError {
    constructor(length: number, maxLength: number) {
        super(`Product name too long: ${length} characters. Maximum allowed: ${maxLength}`, 'PRODUCT_NAME_TOO_LONG');
    }
}

export class TooManyImagesError extends ProductError {
    constructor(count: number, maxImages: number) {
        super(`Too many images: ${count}. Maximum allowed: ${maxImages}`, 'TOO_MANY_IMAGES');
    }
}