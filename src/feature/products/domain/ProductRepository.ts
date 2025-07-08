// ===== src/feature/products/domain/ProductRepository.ts =====
import { Product, CreateProductData, UpdateProductData, ProductFilters } from './Product';

export interface ProductRepository {
    // Crear producto
    create(productData: CreateProductData): Promise<Product>;
    
    // Encontrar producto por UUID
    findByUuid(uuid: string): Promise<Product | null>;
    
    // Encontrar producto por ID
    findById(id: number): Promise<Product | null>;
    
    // Obtener todos los productos con filtros
    findAll(filters?: ProductFilters): Promise<Product[]>;
    
    // Obtener productos de un vendedor específico
    findBySellerId(sellerId: number, filters?: Omit<ProductFilters, 'sellerId'>): Promise<Product[]>;
    
    // Actualizar producto
    update(uuid: string, productData: UpdateProductData): Promise<Product | null>;
    
    // Eliminar producto
    delete(uuid: string): Promise<boolean>;
    
    // Incrementar contador de vistas
    incrementViews(uuid: string): Promise<boolean>;
    
    // Verificar si el producto pertenece al vendedor
    belongsToSeller(uuid: string, sellerId: number): Promise<boolean>;
    
    // Buscar productos por texto (nombre o descripción)
    search(query: string, filters?: ProductFilters): Promise<Product[]>;
    
    // Obtener productos por categoría
    findByCategory(category: string, filters?: Omit<ProductFilters, 'category'>): Promise<Product[]>;
    
    // Contar productos con filtros (para paginación)
    count(filters?: ProductFilters): Promise<number>;
    
    // Obtener categorías disponibles
    getCategories(): Promise<string[]>;
    
    // Verificar si el vendedor puede crear más productos (límites)
    canSellerCreateProduct(sellerId: number): Promise<boolean>;
    
    // Obtener estadísticas del vendedor
    getSellerStats(sellerId: number): Promise<{
        totalProducts: number;
        activeProducts: number;
        totalViews: number;
        totalSales?: number;
    }>;
}