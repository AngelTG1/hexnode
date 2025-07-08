// ===== src/feature/products/application/GetMyProductsUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product, ProductFilters } from '../domain/Product';

export interface GetMyProductsResponse {
    products: Product[];
    stats: {
        totalProducts: number;
        activeProducts: number;
        totalViews: number;
        totalSales?: number;
    };
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export class GetMyProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(sellerId: number, filters: Omit<ProductFilters, 'sellerId'> = {}): Promise<GetMyProductsResponse> {
        console.log('📦 GetMyProductsUseCase - Fetching products for seller:', sellerId);

        // Establecer valores por defecto
        const processedFilters = {
            ...filters,
            page: filters.page || 1,
            limit: Math.min(filters.limit || 20, 100)
        };

        // Obtener productos del vendedor
        const products = await this.productRepository.findBySellerId(sellerId, processedFilters);
        
        // Obtener estadísticas del vendedor
        const stats = await this.productRepository.getSellerStats(sellerId);

        // Obtener el total para paginación (solo de este vendedor)
        const total = await this.productRepository.count({ 
            ...processedFilters, 
            sellerId 
        });

        // Calcular paginación
        const totalPages = Math.ceil(total / processedFilters.limit!);
        const pagination = {
            total,
            page: processedFilters.page!,
            limit: processedFilters.limit!,
            totalPages,
            hasNext: processedFilters.page! < totalPages,
            hasPrev: processedFilters.page! > 1
        };

        console.log(`✅ Found ${products.length} products for seller ${sellerId}`);

        return {
            products,
            stats,
            pagination
        };
    }
}