export class Product {
    constructor(
        public readonly id: number,
        public readonly uuid: string,
        public readonly sellerId: number,
        public readonly name: string,
        public readonly description: string,
        public readonly price: number,
        public readonly stockQuantity: number,
        public readonly category: string,
        public readonly images: string[],
        public readonly status: ProductStatus,
        public readonly viewsCount: number = 0,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) {}

    // Método para obtener respuesta pública del producto
    public toResponse(): ProductResponse {
        return {
            id: this.id,
            uuid: this.uuid,
            sellerId: this.sellerId,
            name: this.name,
            description: this.description,
            price: this.price,
            stockQuantity: this.stockQuantity,
            category: this.category,
            images: this.images,
            status: this.status,
            viewsCount: this.viewsCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Método para obtener respuesta con información del vendedor
    public toResponseWithSeller(sellerName: string): ProductResponseWithSeller {
        return {
            ...this.toResponse(),
            seller: {
                id: this.sellerId,
                name: sellerName
            }
        };
    }

    // Verificar si el producto está disponible
    public isAvailable(): boolean {
        return this.status === 'active' && this.stockQuantity > 0;
    }

    // Verificar si es del vendedor especificado
    public belongsToSeller(sellerId: number): boolean {
        return this.sellerId === sellerId;
    }

    // Calcular descuento (si implementas)
    public calculateDiscountedPrice(discountPercentage: number): number {
        return this.price * (1 - discountPercentage / 100);
    }

    // Verificar si tiene stock suficiente
    public hasEnoughStock(quantity: number): boolean {
        return this.stockQuantity >= quantity;
    }
}

export type ProductStatus = 'active' | 'inactive' | 'pending_approval' | 'rejected';

export interface ProductResponse {
    id: number;
    uuid: string;
    sellerId: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    images: string[];
    status: ProductStatus;
    viewsCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductResponseWithSeller extends ProductResponse {
    seller: {
        id: number;
        name: string;
    };
}

export interface CreateProductData {
    sellerId: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    images?: string[];
}

export interface UpdateProductData {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    category?: string;
    images?: string[];
    status?: ProductStatus;
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: number;
    status?: ProductStatus;
    search?: string; // Búsqueda por nombre o descripción
    page?: number;
    limit?: number;
}