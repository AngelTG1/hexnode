// ===== src/feature/products/application/SearchProductsUseCase.ts =====
import { ProductRepository } from '../domain/ProductRepository';
import { Product, ProductFilters } from '../domain/Product';

export interface SearchProductsResponse {
    products: Product[];
    searchQuery: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    suggestions?: string[]; // Categorías relacionadas o productos similares
}

export class SearchProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(query: string, filters: ProductFilters = {}): Promise<SearchProductsResponse> {
        console.log('🔍 SearchProductsUseCase - Searching for:', query);

        if (!query?.trim()) {
            // Si no hay query, devolver productos con filtros
            const allProductsResult = await this.productRepository.findAll(filters);
            const total = await this.productRepository.count(filters);
            
            return {
                products: allProductsResult,
                searchQuery: '',
                pagination: this.calculatePagination(total, filters),
                suggestions: []
            };
        }

        // Establecer valores por defecto
        const processedFilters: ProductFilters = {
            ...filters,
            page: filters.page || 1,
            limit: Math.min(filters.limit || 20, 100),
            status: filters.status || 'active'
        };

        // Buscar productos
        const products = await this.productRepository.search(query.trim(), processedFilters);
        
        // Obtener total para paginación
        const total = await this.productRepository.count({ 
            ...processedFilters, 
            search: query.trim() 
        });

        // Generar sugerencias (categorías relacionadas)
        const suggestions = await this.generateSuggestions(query, products);

        console.log(`✅ Found ${products.length} products for query: "${query}"`);

        return {
            products,
            searchQuery: query.trim(),
            pagination: this.calculatePagination(total, processedFilters),
            suggestions
        };
    }

    private calculatePagination(total: number, filters: ProductFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const totalPages = Math.ceil(total / limit);

        return {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    private async generateSuggestions(query: string, products: Product[]): Promise<string[]> {
        // Extraer categorías de los productos encontrados
        const categories = [...new Set(products.map(p => p.category))];
        
        // Si hay pocas categorías, obtener todas las categorías disponibles
        if (categories.length < 3) {
            const allCategories = await this.productRepository.getCategories();
            return allCategories.slice(0, 5); // Máximo 5 sugerencias
        }

        return categories.slice(0, 5);
    }
}