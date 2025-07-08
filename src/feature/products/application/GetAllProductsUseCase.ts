// ===== src/feature/products/application/GetAllProductsUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product, ProductFilters } from '../domain/Product';

export interface GetAllProductsResponse {
    products: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: ProductFilters;
}

export class GetAllProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(filters: ProductFilters = {}): Promise<GetAllProductsResponse> {
        console.log('📋 GetAllProductsUseCase - Fetching products with filters:', filters);

        // Establecer valores por defecto
        const processedFilters: ProductFilters = {
            ...filters,
            page: filters.page || 1,
            limit: Math.min(filters.limit || 20, 100), // Máximo 100 productos por página
            status: filters.status || 'active' // Solo productos activos por defecto
        };

        // Obtener productos
        const products = await this.productRepository.findAll(processedFilters);
        
        // Obtener el total para paginación
        const total = await this.productRepository.count(processedFilters);

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

        console.log(`✅ Found ${products.length} products (${total} total)`);

        return {
            products,
            pagination,
            filters: processedFilters
        };
    }
}