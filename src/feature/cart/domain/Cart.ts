// ===== src/feature/cart/domain/Cart.ts =====
export class Cart {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly userId: number,
        public readonly status: CartStatus,
        public readonly totalItems: number,
        public readonly totalAmount: number,
        public readonly currency: string,
        public readonly items: CartItem[],
        public readonly expiresAt?: Date,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) {}

    public toResponse(): CartResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            userId: this.userId,
            status: this.status,
            totalItems: this.totalItems,
            totalAmount: this.totalAmount,
            currency: this.currency,
            items: this.items.map(item => item.toResponse()),
            expiresAt: this.expiresAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    public isEmpty(): boolean {
        return this.totalItems === 0 || this.items.length === 0;
    }

    public hasProduct(productId: number): boolean {
        return this.items.some(item => item.productId === productId);
    }

    public getItem(productId: number): CartItem | undefined {
        return this.items.find(item => item.productId === productId);
    }

    public getTotalValue(): number {
        return this.items.reduce((total, item) => total + item.totalPrice, 0);
    }
}

export class CartItem {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly cartId: number,
        public readonly productId: number,
        public readonly quantity: number,
        public readonly unitPrice: number,
        public readonly totalPrice: number,
        public readonly product?: any, // Información del producto
        public readonly addedAt?: Date,
        public readonly updatedAt?: Date
    ) {}

    public toResponse(): CartItemResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            cartId: this.cartId,
            productId: this.productId,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            totalPrice: this.totalPrice,
            product: this.product,
            addedAt: this.addedAt,
            updatedAt: this.updatedAt
        };
    }

    public canIncreaseQuantity(availableStock: number): boolean {
        return this.quantity < availableStock;
    }

    public calculateTotalPrice(): number {
        return this.quantity * this.unitPrice;
    }
}

// ===== Types =====
export type CartStatus = 'active' | 'abandoned' | 'converted';

// ===== Interfaces =====
export interface CartResponse {
    id: number;
    uuid: string;
    userId: number;
    status: CartStatus;
    totalItems: number;
    totalAmount: number;
    currency: string;
    items: CartItemResponse[];
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CartItemResponse {
    id: number;
    uuid: string;
    cartId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: any;
    addedAt?: Date;
    updatedAt?: Date;
}

export interface AddToCartData {
    userId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface UpdateCartItemData {
    quantity: number;
}

export interface CartSummary {
    totalItems: number;
    totalAmount: number;
    currency: string;
}